var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.lastState = self.STATE_UNKNOWN;
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
			self.status(self.STATE_ERROR, err.message);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			if (self.lastState != self.STATE_OK) {
				self.status(self.STATE_OK);
				self.lastState = self.STATE_OK;
			}
			debug("Connected");
			if (typeof cb == 'function') {
				cb();
			}
		})

		self.socket.on('data', function (data) {});

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

		self.init_tcp(function () {
			self.socket.send(cmd);
		});

	}

};

instance.module_info = {
	label: 'Irisdown Countdown timer 2.0',
	id: 'irisdown-countdowntimer',
	version: '0.0.1'
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
