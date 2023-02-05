/**
 * Get the available actions.
 *
 * @returns {Object[]} the available actions
 * @access public
 * @since 1.1.0
 */

export function compileActionDefinitions(self) {
	const sendCommand = async (cmd) => {
		if (cmd) {
			self.log('debug', `sending ${cmd} to ${self.config.host}`)

			await self.socket.send(cmd + self.lineEndings)
		}
	}

	const actions = {}
	actions['go'] = {
		name: 'Start timer with current duration or resume',
		options: [],
		callback: async () => {
			await sendCommand('GO')
		},
	}
	actions['pause'] = {
		name: 'Pause timer',
		options: [],
		callback: async () => {
			await sendCommand('PAUSE')
		},
	}
	actions['togglePause'] = {
		name: 'Toggle Pause',
		options: [],
		callback: async () => {
			await sendCommand('TOGGLEPAUSE')
		},
	}
	actions['reset'] = {
		name: 'Reset timer',
		options: [],
		callback: async () => {
			await sendCommand('RESET')
		},
	}
	actions['message'] = {
		name: 'Message text',
		options: [
			{
				type: 'textinput',
				label: 'Your message',
				id: 'message',
				useVariables: true,
			},
		],
		callback: async (action, context) => {
			const message = await context.parseVariablesInString(action.options.message)
			await sendCommand(`MESSAGE "${message}"`)
		},
	}
	actions['messageClear'] = {
		name: 'Message clear',
		options: [],
		callback: async () => {
			await sendCommand('MESSAGE CLEAR')
		},
	}
	actions['jog'] = {
		name: 'Jog timer up/down',
		options: [
			{
				type: 'textinput',
				label: 'Time in minutes',
				id: 'minutes',
				default: '1',
				regex: '/-?([0-9])/',
			},
		],
		callback: async (action) => {
			await sendCommand(`JOG ${action.options.minutes}`)
		},
	}
	actions['resetT'] = {
		name: 'Reset timer with new duration <time>',
		options: [
			{
				type: 'textinput',
				label: '<time> mm, mm:ss or hh:mm:ss (use leading zero)',
				id: 'time',
				default: '',
			},
		],
		callback: async (action) => {
			await sendCommand(`RESET ${action.options.time}`)
		},
	}
	actions['displayM'] = {
		name: 'Change display mode',
		options: [
			{
				type: 'dropdown',
				label: 'Display mode',
				id: 'mode',
				default: 'TIMER',
				choices: [
					{ id: 'TIMER', label: 'Timer' },
					{ id: 'CLOCK', label: 'Clock' },
					{ id: 'BLACK', label: 'Black' },
					{ id: 'TEST', label: 'Test' },
				],
			},
		],
		callback: async (action) => {
			await sendCommand(`DISPLAY ${action.options.mode}`)
		},
	}
	return actions
}
