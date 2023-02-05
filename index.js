import { InstanceBase, InstanceStatus, TCPHelper, runEntrypoint } from '@companion-module/base'
import { compileActionDefinitions } from './actions.js'
import { compileFeedbackDefinitions } from './feedback.js'
import { compilePresetDefinitions } from './presets.js'
import { compileVariableDefinitions } from './variables.js'
import { getConfigFields } from './config.js'
import { UpgradeScripts } from './upgrade.js'

class CountdownInstance extends InstanceBase {
	lineEndings = ''
	feedbackstate = {
		time: '00:00:00',
		state: 'STOPPED',
		mode: 'TIMER',
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.1.0
	 */
	getConfigFields() {
		return getConfigFields(this)
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.1.0
	 */
	async destroy() {
		if (this.timer) {
			clearInterval(this.timer)
			delete this.timer
		}

		if (this.socket) {
			this.socket.destroy()
		}
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.1.0
	 */
	async configUpdated(config) {
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		this.config = config
		if (resetConnection || !this.socket) {
			this.init_tcp()
		}
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.1.0
	 */
	async init(config) {
		this.config = config

		this.setActionDefinitions(compileActionDefinitions(this))
		this.setFeedbackDefinitions(compileFeedbackDefinitions(this))
		this.setVariableDefinitions(compileVariableDefinitions(this))
		this.setPresetDefinitions(compilePresetDefinitions())

		this.updateVariables()

		this.init_tcp()
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, 61002, { reconnect: true })

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.UnknownError, err.message)
				this.log('error', 'Network error: ' + err.message)
			})

			let receivebuffer = ''

			this.socket.on('connect', () => {
				this.updateStatus(InstanceStatus.Ok)

				this.feedbackstate = {
					time: '00:00:00',
					state: 'STOPPED',
					mode: 'TIMER',
				}

				this.socket.send('VERSION\r\n').catch((e) => {
					this.log('error', `Socket error: ${e}`)
				})
				receivebuffer = ''
			})

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				let i = 0
				let line = ''
				let offset = 0

				receivebuffer += chunk.toString()

				while ((i = receivebuffer.indexOf('\r\n', offset)) !== -1) {
					line = receivebuffer.slice(offset, i)
					offset = i + 2
					this.socket.emit('receiveline', line)
				}
				receivebuffer = receivebuffer.slice(offset)
			})

			this.socket.on('receiveline', (data) => {
				const info = data.toString().split(/ /)
				if (info.length == 2) {
					if (info[0] == 'VERSION') {
						// All versions that support the VERSION command supports update events
						this.lineEndings = '\r\n'
						//Brainfreeze put version in function to check
						if (this.compareVersion(info[1], '2.0.9.3') > 0) {
							this.socket.send('UPDATEMODE 2\r\n').catch((e) => {
								this.log('error', `Socket error: ${e}`)
							})
						}

						this.socket.send('UPDATES ON\r\n').catch((e) => {
							this.log('error', `Socket error: ${e}`)
						})
						this.log('info', 'Connected to Countdown Timer v' + info[1])

						this.checkFeedbacks('state_color', 'mode_color', 'message_on')
						this.updateVariables()
					}
				}

				//00:05:00,STOPPED,TIMER => MODE 1
				//TIME=+00:04:55&STATE=PAUSED&DISPLAY=TIMER&MESSAGE=FALSE => MODE 2

				//MODE 1
				if (info.length == 3) {
					if (this.feedbackstate.mode != info[2]) {
						this.feedbackstate.mode = info[2]
					}

					if (this.feedbackstate.state != info[1]) {
						this.feedbackstate.state = info[1]
					}

					if (this.feedbackstate.time != info[0]) {
						this.feedbackstate.time = info[0]
					}

					this.checkFeedbacks()
					this.updateVariables()
				} else if (info[0].match('MESSAGE')) {
					let feedbackFromSoftware = info[0].split('&')
					let time = feedbackFromSoftware[0].slice(feedbackFromSoftware[0].indexOf('=') + 2)
					let state = feedbackFromSoftware[1].slice(feedbackFromSoftware[1].indexOf('=') + 1)
					let mode = feedbackFromSoftware[2].slice(feedbackFromSoftware[2].indexOf('=') + 1)
					let messageBool = feedbackFromSoftware[3].slice(feedbackFromSoftware[3].indexOf('=') + 1)

					if (this.feedbackstate.mode != mode) {
						this.feedbackstate.mode = mode
					}

					if (this.feedbackstate.state != state) {
						this.feedbackstate.state = state
					}

					if (this.feedbackstate.message != messageBool) {
						this.feedbackstate.message = messageBool
					}

					if (this.feedbackstate.time != time) {
						this.feedbackstate.time = time
					}

					this.updateVariables()
					this.checkFeedbacks()
				}
			})

			this.socket.on('end', () => {
				this.updateStatus(InstanceStatus.Disconnected)
				this.log('debug', 'Disconnected, ok')
				this.socket.destroy()
				delete this.socket
			})
		}
	}

	compareVersion(v1, v2) {
		if (typeof v1 !== 'string') return false
		if (typeof v2 !== 'string') return false
		v1 = v1.split('.')
		v2 = v2.split('.')
		const k = Math.min(v1.length, v2.length)
		for (let i = 0; i < k; ++i) {
			v1[i] = parseInt(v1[i], 10)
			v2[i] = parseInt(v2[i], 10)
			if (v1[i] > v2[i]) return 1
			if (v1[i] < v2[i]) return -1
		}
		return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1
	}

	updateVariables() {
		const info = this.feedbackstate.time.split(':')

		const states = {
			PLAYING: 'Running',
			PAUSED: 'Paused',
			STOPPED: 'Stopped',
		}

		this.setVariableValues({
			time: this.feedbackstate.time,
			time_hm: info[0] + ':' + info[1],

			time_h: info[0],
			time_m: info[1],
			time_s: info[2],

			state: states[this.feedbackstate.state],
			mode: this.feedbackstate.mode,
		})
	}
}

runEntrypoint(CountdownInstance, UpgradeScripts)
