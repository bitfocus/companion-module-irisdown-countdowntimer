import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import net from 'node:net'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'
import { test } from 'node:test'
import { SourceTextModule, SyntheticModule } from 'node:vm'
import * as sdk from '@companion-module/base'

// Only replace the process entrypoint. Module code and TCPHelper use the installed SDK.
async function loadInstance() {
	let Instance
	const entry = new SourceTextModule(await readFile(new URL('../index.js', import.meta.url), 'utf8'))
	await entry.link(async (specifier) => {
		const exports = specifier === '@companion-module/base'
			? { ...sdk, runEntrypoint: (value) => { Instance = value } }
			: await import(new URL(`../${specifier}`, import.meta.url))
		return new SyntheticModule(Object.keys(exports), function () {
			for (const [key, value] of Object.entries(exports)) this.setExport(key, value)
		})
	})
	await entry.evaluate()
	// Companion owns InstanceBase construction and IPC. Capture its host-facing methods.
	const instance = Object.create(Instance.prototype)
	Object.assign(instance, {
		lineEndings: '', feedbackstate: { time: '00:00:00', state: 'STOPPED', mode: 'TIMER' },
		log() {}, updateStatus() {}, checkFeedbacks() {},
		setActionDefinitions(value) { this.actions = value },
		setFeedbackDefinitions(value) { this.feedbacks = value },
		setVariableDefinitions() {}, setPresetDefinitions() {},
		setVariableValues(value) { this.variables = value },
	})
	return instance
}

async function waitFor(predicate) {
	for (let attempt = 0; attempt < 200; attempt++) {
		if (predicate()) return
		await delay(10)
	}
	assert.fail('Timed out waiting for protocol event')
}

test('TCP handshake, actions, fragmented feedback and configuration reconnect', async (t) => {
	const peers = []
	const commands = []
	const server = net.createServer((socket) => {
		peers.push(socket)
		socket.on('error', () => {})
		let buffer = ''
		socket.on('data', (chunk) => {
			buffer += chunk
			let end
			while ((end = buffer.indexOf('\r\n')) !== -1) {
				const command = buffer.slice(0, end)
				buffer = buffer.slice(end + 2)
				commands.push(command)
				if (command === 'VERSION') socket.write('VERSION 2.0.9.4\r\n')
			}
		})
	})
	server.listen(61002, '0.0.0.0')
	await once(server, 'listening')
	const instance = await loadInstance()
	t.after(async () => {
		await instance.destroy()
		for (const peer of peers) peer.destroy()
		await new Promise((resolve) => server.close(resolve))
	})
	await instance.init({ host: '127.0.0.1' })
	await waitFor(() => commands.includes('UPDATES ON'))
	assert.deepEqual(commands.slice(0, 3), ['VERSION', 'UPDATEMODE 2', 'UPDATES ON'])
	for (const [id, options] of [
		['go', {}], ['pause', {}], ['togglePause', {}], ['reset', {}],
		['jog', { minutes: '-2' }], ['resetT', { time: '00:05:00' }],
		['displayM', { mode: 'CLOCK' }], ['messageClear', {}],
	]) await instance.actions[id].callback({ options })
	await instance.actions.message.callback({ options: { message: '$(custom:message)' } }, {
		parseVariablesInString: async (text) => {
			assert.equal(text, '$(custom:message)')
			return 'Ready now'
		},
	})
	await waitFor(() => commands.includes('MESSAGE "Ready now"'))
	assert.deepEqual(commands.slice(3), [
		'GO', 'PAUSE', 'TOGGLEPAUSE', 'RESET', 'JOG -2', 'RESET 00:05:00',
		'DISPLAY CLOCK', 'MESSAGE CLEAR', 'MESSAGE "Ready now"',
	])
	peers[0].write('TIME=+00:04:55&STATE=PAUSED&DISPLAY=TIMER&MESSAGE=TR')
	await delay(20)
	assert.equal(instance.variables.state, 'Stopped')
	peers[0].write('UE\r\n')
	await waitFor(() => instance.variables.state === 'Paused')
	assert.equal(instance.variables.time, '00:04:55')
	assert.equal(instance.feedbacks.message_on.callback({ options: {} }), true)
	assert.equal(instance.feedbacks.mode_color.callback({ options: { mode: 'TIMER' } }), true)
	assert.deepEqual(instance.feedbacks.state_color.callback({ options: { pause_fg: 1, pause_bg: 2 } }), { color: 1, bgcolor: 2 })
	peers[0].write('00:03:00 PLAYING CLOCK\r\n')
	await waitFor(() => instance.variables.state === 'Running')
	assert.equal(instance.variables.time_m, '03')
	assert.equal(instance.variables.mode, 'CLOCK')
	const firstSocket = instance.socket
	await instance.configUpdated({ host: '127.0.0.1' })
	assert.equal(instance.socket, firstSocket)
	await instance.configUpdated({ host: '127.0.0.2' })
	assert.notEqual(instance.socket, firstSocket)
	await waitFor(() => peers.length === 2 && commands.filter((command) => command === 'UPDATES ON').length === 2)
})
