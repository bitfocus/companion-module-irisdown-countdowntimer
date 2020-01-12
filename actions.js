module.exports = {

	/**
	* Get the available actions.
	*
	* @returns {Object[]} the available actions
	* @access public
	* @since 1.1.0
	*/

	getActions() {
		var actions = {};
		actions['go'] = { label: 'Start timer with current duration or resume'},
		actions['pause'] = { label: 'Pause timer'},
		actions['togglePause'] = { label: 'Toggle Pause'},
		actions['reset'] = { label: 'Reset timer'},
		actions['message'] = {
			label: 'Message text',
			options: [{
					type: 'textinput',
					label: 'Your message',
					id: 'message'
			}]
		},
		actions['messageClear'] = { label: 'Message clear'},
		actions['jog'] = {
			label: 'Jog timer up/down',
			options: [{
				type: 'textinput',
				label: 'Time in minutes',
				id: 'minutes',
				default: '1',
				regex: '/-?([0-9])/'
			}]
		},
		actions['resetT'] = {
			label: 'Reset timer with new duration <time>',
			options: [{
					type: 'textinput',
					label: '<time> mm, mm:ss or hh:mm:ss (use leading zero)',
					id: 'time',
					default: ''
			}]
		},
		actions['displayM'] = {
			label: 'Change display mode',
			options: [{
					type: 'dropdown',
					label: 'Display mode',
					id: 'mode',
					default: 'TIMER',
					choices: [
						{ id: 'TIMER', label: 'Timer'},
						{ id: 'CLOCK', label: 'Clock'},
						{ id: 'BLACK', label: 'Black'},
						{ id: 'TEST',  label: 'Test'}
					]
			}]
		}
		return actions;
	}
}
