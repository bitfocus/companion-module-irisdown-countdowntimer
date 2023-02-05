import { combineRgb } from '@companion-module/base'

/**
 * Get the available feedbacks.
 *
 * @returns {Object[]} the available feedbacks
 * @access public
 * @since 1.1.0
 */
export function compileFeedbackDefinitions(self) {
	const feedbacks = {}

	feedbacks['state_color'] = {
		type: 'advanced',
		name: 'Change color from state',
		description: 'Change the colors of a bank according to the timer state',
		options: [
			{
				type: 'colorpicker',
				label: 'Running: Foreground color',
				id: 'run_fg',
				default: combineRgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Running: Background color',
				id: 'run_bg',
				default: combineRgb(255, 0, 0),
			},
			{
				type: 'colorpicker',
				label: 'Paused: Foreground color',
				id: 'pause_fg',
				default: combineRgb(255, 255, 255),
			},
			{
				type: 'colorpicker',
				label: 'Paused: Background color',
				id: 'pause_bg',
				default: combineRgb(255, 0, 0),
			},
		],
		callback: (feedback) => {
			if (self.feedbackstate.state == 'PLAYING') {
				return {
					color: feedback.options.run_fg,
					bgcolor: feedback.options.run_bg,
				}
			} else if (self.feedbackstate.state == 'PAUSED') {
				return {
					color: feedback.options.pause_fg,
					bgcolor: feedback.options.pause_bg,
				}
			}
		},
	}

	feedbacks['mode_color'] = {
		type: 'boolean',
		name: 'Change color from display mode',
		description: 'Change the colors of a bank according to the current display mode',
		options: [
			{
				type: 'dropdown',
				label: 'Mode',
				id: 'mode',
				choices: [
					{ id: 'TIMER', label: 'Timer' },
					{ id: 'CLOCK', label: 'Clock' },
					{ id: 'BLACK', label: 'Black' },
					{ id: 'TEST', label: 'Test' },
				],
				default: 'TIMER',
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: (feedback) => {
			return self.feedbackstate.mode == feedback.options.mode
		},
	}

	feedbacks['message_on'] = {
		type: 'boolean',
		name: 'Change color when message is active',
		description: 'Change the colors of a bank according when message is active',
		options: [],
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(255, 0, 0),
		},
		callback: (feedback) => {
			return self.feedbackstate.message == 'TRUE'
		},
	}

	return feedbacks
}
