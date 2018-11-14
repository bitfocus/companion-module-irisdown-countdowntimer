var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	self.feedbackstate = {
		time: '00:00:00',
		state: 'STOPPED'
	};

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.init_tcp();
	self.config = config;
	self.init_presets();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_tcp();
	self.init_presets();
	self.init_feedbacks();
	self.init_variables();
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	var feedbacks = {
		state_color: {
			label: 'Change color from state',
			description: 'Change the colors of a bank according to the timer state',
			options: [
				{
					type: 'colorpicker',
					label: 'Running: Foreground color',
					id: 'run_fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Running: Background color',
					id: 'run_bg',
					default: self.rgb(255,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Paused: Foreground color',
					id: 'pause_fg',
					default: self.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Paused: Background color',
					id: 'pause_bg',
					default: self.rgb(255,0,0)
				}
			]
		}
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.init_variables = function() {
	var self = this;

	var variables = [
		{
			label: 'State of timer (Running, Paused, Stopped)',
			name: 'state'
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

	self.updateTime();
	self.setVariableDefinitions(variables);
};

instance.prototype.updateTime = function() {
	var self = this;
	var info = self.feedbackstate.time.split(':');

	self.setVariable('time', self.feedbackstate.time);
	self.setVariable('time_hm', info[0] + ':' + info[1]);

	self.setVariable('time_h', info[0]);
	self.setVariable('time_m', info[1]);
	self.setVariable('time_s', info[2]);
};

instance.prototype.updateState = function() {
	var self = this;
	var states = {
		'PLAYING': 'Running',
		'PAUSED': 'Paused',
		'STOPPED': 'Stopped'
	};

	self.setVariable('state', states[self.feedbackstate.state]);
};

instance.prototype.init_tcp = function(cb) {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 61002, { reconnect: false });

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATUS_ERROR, err.message);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			if (self.currentStatus != self.STATUS_OK) {
				self.status(self.STATUS_OK);

				self.feedbackstate = {
					time: '00:00:00',
					state: 'STOPPED'
				};

				self.socket.send("UPDATES ON \n");
				self.socket.receivebuffer = '';

				self.checkFeedbacks('state_color');
				self.updateState();
			}
			debug("Connected");
			if (typeof cb == 'function') {
				cb();
			}
		})

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {
			var i = 0, line = '', offset = 0;

			self.socket.receivebuffer += chunk;

			while ( (i = self.socket.receivebuffer.indexOf('\r\n', offset)) !== -1) {
				line = self.socket.receivebuffer.substr(offset, i - offset);
				offset = i + 2;
				self.socket.emit('receiveline', line.toString());
			}
			self.socket.receivebuffer = self.socket.receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function (data) {
			var info = data.toString().split(/ /);

			if (info.length == 2) {

				if (self.feedbackstate.state != info[1]) {
					self.feedbackstate.state = info[1];
					self.checkFeedbacks('state_color');
					self.updateState();
				}

				if (self.feedbackstate.time != info[0]) {
					self.feedbackstate.time = info[0];
					self.updateTime();
				}
			}
		});

		self.socket.on('end', function () {
			debug('Disconnected, ok');
			self.socket.destroy();
			delete self.socket;
		});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
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
			regex: self.REGEX_IP
		},
		{
			type: 'text',
			id: 'info',
			width: 6,
			label: 'Feedback',
			value: 'This module has support for getting information about the timer back to companion. But this feature requires Countdown Timer version 2.0.9 or later.'
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.timer) {
		clearInterval(self.timer);
		delete self.timer;
	}

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

		presets.push({
			category: 'Timer',
			label: 'GO',
			bank: {
				style: 'text',
				text: 'GO',
				size: '24',
				color: '16777215',
				bgcolor: self.rgb(0,255,0)
			},
			actions: [
				{
					action: 'go',
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Pause',
			bank: {
				style: 'text',
				text: 'PAUSE',
				size: '18',
				color: self.rgb(0,0,0),
				bgcolor: self.rgb(255,255,0)
			},
			actions: [
				{
					action: 'pause',
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Reset',
			bank: {
				style: 'text',
				text: 'RESET',
				size: '18',
				color: self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,255)
			},
			actions: [
				{
					action: 'reset',
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Set 5 min',
			bank: {
				style: 'text',
				text: 'SET\\n5 MIN',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,255)
			},
			actions: [
				{
					action: 'resetT',
					options: {
						time: '5',
					}
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Set 10 min',
			bank: {
				style: 'text',
				text: 'SET\\n10 MIN',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,255)
			},
			actions: [
				{
					action: 'resetT',
					options: {
						time: '10',
					}
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Set 15 min',
			bank: {
				style: 'text',
				text: 'SET\\n15 MIN',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,255)
			},
			actions: [
				{
					action: 'resetT',
					options: {
						time: '15',
					}
				}
			]
		});

		presets.push({
			category: 'Timer',
			label: 'Black ',
			bank: {
				style: 'text',
				text: 'BLACK',
				size: '18',
				color: '16777215',
				bgcolor: self.rgb(0,0,255),
				latch: true
			},
			actions: [
				{
					action: 'displayM',
					options: {
						mode: 'BLACK',
					}
				}
			],
			release_actions: [
				{
					action: 'displayM',
					options: {
						mode: 'TIMER',
					}
				}
			]
		});


	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'go':           { label: 'Start timer with current duration or resume'},
		'pause':        { label: 'Pause timer'},
		'togglePause':  { label: 'Toggle Pause'},
		'reset':        { label: 'Reset timer'},
		'resetT':   		{
			label: 'Reset timer with new duration <time>',
			options: [
			 {
					type: 'textinput',
					label: '<time> mm for minutes or hh:mm for hours',
					id: 'time',
					default: ''
			 }
			]
		 },
		'displayM':  {
			label: 'Change display mode',
			options: [
			 {
					type: 'dropdown',
					label: 'Display mode',
					id: 'mode',
					choices: [
						{ id: 'TIMER', label: 'Timer'},
						{ id: 'CLOCK', label: 'Clock'},
						{ id: 'BLACK', label: 'Black'},
						{ id: 'TEST',  label: 'Test'}
					]
			 }
			]
		 },

	});
};

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var cmd
	var opt = action.options

	switch (action.action){

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

		case 'resetT':
			cmd = 'RESET ' + opt.time;
			break;

		case 'displayM':
			cmd = 'DISPLAY ' + opt.mode;
			break;

	};




	if (cmd !== undefined) {

		debug('sending ',cmd,"to",self.config.host);

		if (self.currentStatus != self.STATUS_OK) {
			self.init_tcp(function () {
				self.socket.send(cmd + " \n");
			});
		} else {
			self.socket.send(cmd + " \n");
		}
	}

};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type = 'state_color') {
		if (self.feedbackstate.state == 'PLAYING') {
			return {
				color: feedback.options.run_fg,
				bgcolor: feedback.options.run_bg
			};
		}
		else if (self.feedbackstate.state == 'PAUSED') {
			return {
				color: feedback.options.pause_fg,
				bgcolor: feedback.options.pause_bg
			}
		}
	}
};


instance_skel.extendedBy(instance);
exports = module.exports = instance;
