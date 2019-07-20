module.exports = {

		/**
		* Get the available feedbacks.
		*
		* @returns {Object[]} the available feedbacks
		* @access public
		* @since 1.1.0
		*/

		getFeedbacks() {
			var feedbacks = {}

			feedbacks['state_color'] = {
				label: 'Change color from state',
				description: 'Change the colors of a bank according to the timer state',
				options: [
					{
						type: 'colorpicker',
						label: 'Running: Foreground color',
						id: 'run_fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Running: Background color',
						id: 'run_bg',
						default: this.rgb(255,0,0)
					},
					{
						type: 'colorpicker',
						label: 'Paused: Foreground color',
						id: 'pause_fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Paused: Background color',
						id: 'pause_bg',
						default: this.rgb(255,0,0)
					}
				],
				callback: (feedback, bank) => {
					if (this.feedbackstate.state == 'PLAYING') {
						return {
							color: feedback.options.run_fg,
							bgcolor: feedback.options.run_bg
						};
					}
					else if (this.feedbackstate.state == 'PAUSED') {
						return {
							color: feedback.options.pause_fg,
							bgcolor: feedback.options.pause_bg
						}
					}
				}
			},
			feedbacks['mode_color'] = {
				label: 'Change color from display mode',
				description: 'Change the colors of a bank according to the current display mode',
				options: [
					{
						type: 'dropdown',
						label: 'Mode',
						id: 'mode',
						choices: [
							{ id: 'TIMER', label: 'Timer'},
							{ id: 'CLOCK', label: 'Clock'},
							{ id: 'BLACK', label: 'Black'},
							{ id: 'TEST',  label: 'Test'}
						],
						default: 'TIMER'
					},
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(255,0,0)
					}
				],
				callback: (feedback, bank) => {
					if (this.feedbackstate.mode == feedback.options.mode) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			},
			feedbacks['message_on'] = {
				label: 'Change color when message is active',
				description: 'Change the colors of a bank according when message is active',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'run_fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'run_bg',
						default: this.rgb(255,0,0)
					}
				],
				callback: (feedback, bank) => {
					if (this.feedbackstate.message == 'TRUE') {
						return {
							color: feedback.options.run_fg,
							bgcolor: feedback.options.run_bg
						};
					}
				}
			}

			return feedbacks;
		}
}
