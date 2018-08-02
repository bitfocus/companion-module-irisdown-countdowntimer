var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var ping = require('ping');
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

	self.config = config;
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATE_UNKNOWN, 'Checking ping response');

	self.timer = setInterval(function () {
		ping.sys.probe(self.config.host, function(isAlive) {
			if (isAlive) {
				if (self.lastState !== self.STATE_OK && self.lastState !== self.STATE_ERROR) {
					self.status(self.STATE_OK);
					self.lastState = self.STATE_OK;
				}
			} else {
				if (self.lastState != self.STATE_WARNING) {
					self.status(self.STATE_WARNING, 'No ping response');
					self.lastState = self.STATE_WARNING;
				}
			}
		}, { timeout: 2 });
	}, 5000);
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
