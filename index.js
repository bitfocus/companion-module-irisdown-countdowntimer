var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var actions       = require('./actions');
var feedback      = require('./feedback');
var presets       = require('./presets');

var debug;
var log;
var lineEndings;

class instance extends instance_skel {
	/**
	* Create an instance.
	*
	* @param {EventEmitter} system - the brains of the operation
	* @param {string} id - the instance ID
	* @param {Object} config - saved user configuration parameters
	* @since 1.1.0
	*/
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, {...actions,...feedback,...presets});

		this.lineEndings = '';
		this.feedbackstate = {
			time: '00:00:00',
			state: 'STOPPED',
			mode: 'TIMER',
		};

		this.actions(); // export actions

	}
	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.1.0
	 */
	actions(system) {
		this.setActions(this.getActions());
	}
	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.1.0
	 */
	config_fields() {

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls Countdown timer 2.0 by <a href="http://irisdown.co.uk" target="_new">Irisdown</a>. Go over to their website to download the program.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'text',
				id: 'info',
				width: 6,
				label: 'Feedback',
				value: 'This module has support for getting information about the timer back to companion. But this feature requires Countdown Timer version 2.0.9 or later.'
			}
		]
	}
	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (id){

			case 'go':
				cmd = 'GO';
				break;

			case 'pause':
				cmd = 'PAUSE' ;
				break;

			case 'togglePause':
				cmd = 'TOGGLEPAUSE';
				break;

			case 'reset':
				cmd = 'RESET';
				break;

			case 'messageClear':
				cmd = 'MESSAGE CLEAR';
				break;

			case 'message':
				cmd = 'MESSAGE "' + opt.message + '"';
				break;

			case 'jog':
				cmd = 'JOG ' + opt.minutes;
				break;

			case 'updateMode':
				cmd = 'UPDATEMODE ' + opt.mode;
				break;

			case 'resetT':
				cmd = 'RESET ' + opt.time;
				break;

			case 'displayM':
				cmd = 'DISPLAY ' + opt.mode;
				break;

		}

		if (cmd !== undefined) {
			debug('sending ', cmd, "to", this.config.host);
			if (this.currentStatus != this.STATUS_OK) {
				this.init_tcp(function() {
					this.socket.send(cmd + this.lineEndings);
				});
			} else {
				this.socket.send(cmd + this.lineEndings);
			}
		}
	}
	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.1.0
	 */
	destroy() {

		if (this.timer) {
			clearInterval(this.timer);
			delete this.timer;
		}

		if (this.socket !== undefined) {
			this.socket.destroy();
		}
		debug("destroy", this.id);
	}
	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.1.0
	 */
	init() {
		debug = this.debug;
		log = this.log;

		this.initPresets();
		this.init_tcp();
	}
	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	init_tcp() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, 61002, { reconnect: false });

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				this.debug("Network error", err);
				this.log('error',"Network error: " + err.message);
			});

			this.socket.on('connect', () => {
				this.debug("Connected");
				this.feedbackstate = {
					time: '00:00:00',
					state: 'STOPPED',
					mode: 'TIMER'
				};

				this.socket.send("VERSION\r\n");
				this.socket.receivebuffer = '';
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;

				this.socket.receivebuffer += chunk;

				while ( (i = this.socket.receivebuffer.indexOf('\r\n', offset)) !== -1) {
					line = this.socket.receivebuffer.substr(offset, i - offset);
					offset = i + 2;
					this.socket.emit('receiveline', line.toString());
				}
				this.socket.receivebuffer = this.socket.receivebuffer.substr(offset);
			});

			this.socket.on('receiveline', (data) => {
				var info = data.toString().split(/ /);
				if (info.length == 2) {
					if (info[0] == 'VERSION') {
						// All versions that support the VERSION command supports update events
						this.lineEndings = "\r\n";
						//Brainfreeze put version in function to check
						if (this.compareVersion(info[1], "2.0.9.3") > 0) {
							this.socket.send("UPDATEMODE 2");
						}

						this.socket.send("UPDATES ON\r\n");
						this.log('info', 'Connected to Countdown Timer v' + info[1]);

						this.initFeedbacks();
						this.initVariables();

						this.checkFeedbacks('state_color');
						this.checkFeedbacks('mode_color');
						this.checkFeedbacks('message_on');
						this.updateState();
						this.updateMode();

						// Include feedback variables
						this.initPresets(true);
					}
				}

				//00:05:00,STOPPED,TIMER => MODE 1
				//TIME=+00:04:55&STATE=PAUSED&DISPLAY=TIMER&MESSAGE=FALSE => MODE 2

				//MODE 1
				if (info.length == 3) {

					if (this.feedbackstate.mode != info[2]) {
						this.feedbackstate.mode = info[2];
						this.checkFeedbacks('mode_color');
						this.updateMode();
					}

					if (this.feedbackstate.state != info[1]) {
						this.feedbackstate.state = info[1];
						this.checkFeedbacks('state_color');
						this.updateState();
					}

					if (this.feedbackstate.time != info[0]) {
						this.feedbackstate.time = info[0];
						this.updateTime();
					}
				}
				else if (info[0].match("MESSAGE")) {
					var feedbackFromSoftware = info[0].split("&");
					var time = feedbackFromSoftware[0].slice(feedbackFromSoftware[0].indexOf("=")+2);
					var state = feedbackFromSoftware[1].slice(feedbackFromSoftware[1].indexOf("=")+1);
					var mode = feedbackFromSoftware[2].slice(feedbackFromSoftware[2].indexOf("=")+1);
					var messageBool = feedbackFromSoftware[3].slice(feedbackFromSoftware[3].indexOf("=")+1);

					if (this.feedbackstate.mode != mode) {
						this.feedbackstate.mode = mode;
						this.checkFeedbacks('mode_color');
						this.updateMode();
					}

					if (this.feedbackstate.state != state) {
						this.feedbackstate.state = state;
						this.checkFeedbacks('state_color');
						this.updateState();
					}

					if (this.feedbackstate.message != messageBool) {
						this.feedbackstate.message = messageBool;
						this.checkFeedbacks('message_on');
					}

					if (this.feedbackstate.time != time) {
						this.feedbackstate.time = time;
						this.updateTime();
					}
				}
			});

			this.socket.on('end', () => {
				debug('Disconnected, ok');
				this.socket.destroy();
				delete this.socket;
			});
		}
	}
	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks();

		this.setFeedbackDefinitions(feedbacks);
	}
	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initPresets (updates) {
		var presets = this.getPresets(updates);

		this.setPresetDefinitions(presets);
	}
	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.1.0
	 */
	updateConfig (config) {
		var resetConnection = false;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;
		this.initPresets();
		if (resetConnection === true || this.socket === undefined) {
			this.init_tcp();
		}
	}
	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initVariables() {

		var variables = [
			{
				label: 'State of timer (Running, Paused, Stopped)',
				name: 'state'
			},
			{
				label: 'Mode of display (TIMER, CLOCK, BLACK, TEST)',
				name: 'mode'
			},
			{
				label: 'Current time of timer (hh:mm:ss)',
				name: 'time'
			},
			{
				label: 'Current time of timer (hh:mm)',
				name: 'time_hm'
			},
			{
				label: 'Current time of timer (hours)',
				name: 'time_h'
			},
			{
				label: 'Current time of timer (minutes)',
				name: 'time_m'
			},
			{
				label: 'Current time of timer (seconds)',
				name: 'time_s'
			},
		];

		this.updateTime();
		this.setVariableDefinitions(variables);
	}

	compareVersion(v1, v2) {
			if (typeof v1 !== 'string') return false;
			if (typeof v2 !== 'string') return false;
			v1 = v1.split('.');
			v2 = v2.split('.');
			const k = Math.min(v1.length, v2.length);
			for (let i = 0; i < k; ++ i) {
					v1[i] = parseInt(v1[i], 10);
					v2[i] = parseInt(v2[i], 10);
					if (v1[i] > v2[i]) return 1;
					if (v1[i] < v2[i]) return -1;
			}
			return v1.length == v2.length ? 0: (v1.length < v2.length ? -1 : 1);
	}

	updateTime() {
		var info = this.feedbackstate.time.split(':');

		this.setVariable('time', this.feedbackstate.time);
		this.setVariable('time_hm', info[0] + ':' + info[1]);

		this.setVariable('time_h', info[0]);
		this.setVariable('time_m', info[1]);
		this.setVariable('time_s', info[2]);
	}

	updateState() {
		var states = {
			'PLAYING': 'Running',
			'PAUSED': 'Paused',
			'STOPPED': 'Stopped'
		};

		this.setVariable('state', states[this.feedbackstate.state]);
	}

	updateMode() {
		this.setVariable('mode', this.feedbackstate.mode);
	}

}

exports = module.exports = instance;
