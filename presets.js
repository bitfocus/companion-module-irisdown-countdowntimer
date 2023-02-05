import { combineRgb } from '@companion-module/base'

/**
 * Get the available presets.
 *
 * @returns {Object[]} the available feedbacks
 * @access public
 * @since 1.1.0
 */
export function compilePresetDefinitions() {
	const presets = {}

	presets['timer-go'] = {
		type: 'button',
		category: 'Timer control',
		name: 'GO',
		style: {
			text: 'GO',
			size: '24',
			color: '16777215',
			bgcolor: combineRgb(0, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'go',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-pause'] = {
		type: 'button',
		category: 'Timer control',
		name: 'Pause',
		style: {
			text: 'PAUSE',
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'pause',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-minute-add'] = {
		type: 'button',
		category: 'Timer control',
		name: '+1 minute',
		style: {
			text: '+1 min',
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'jog',
						options: {
							minutes: '1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-minute-sub'] = {
		type: 'button',
		category: 'Timer control',
		name: '-1 minute',
		style: {
			text: '-1 min',
			size: '18',
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 255, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'jog',
						options: {
							minutes: '-1',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-reset'] = {
		type: 'button',
		category: 'Timer control',
		name: 'Reset',
		style: {
			text: 'RESET',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'reset',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-minutes-5'] = {
		type: 'button',
		category: 'Timer control',
		name: 'Set 5 min',
		style: {
			text: 'SET\\n5 MIN',
			size: '18',
			color: '16777215',
			bgcolor: combineRgb(0, 0, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'resetT',
						options: {
							time: '5',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-minutes-10'] = {
		type: 'button',
		category: 'Timer control',
		name: 'Set 10 min',
		style: {
			text: 'SET\\n10 MIN',
			size: '18',
			color: '16777215',
			bgcolor: combineRgb(0, 0, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'resetT',
						options: {
							time: '10',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['timer-minutes-15'] = {
		type: 'button',
		category: 'Timer control',
		name: 'Set 15 min',
		style: {
			text: 'SET\\n15 MIN',
			size: '18',
			color: '16777215',
			bgcolor: combineRgb(0, 0, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'resetT',
						options: {
							time: '15',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['mode-black'] = {
		type: 'button',
		category: 'Mode',
		name: 'Black',
		style: {
			text: 'BLACK',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'displayM',
						options: {
							mode: 'BLACK',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'mode_color',
				options: {
					bg: combineRgb(0, 0, 255),
					fg: combineRgb(255, 255, 255),
					mode: 'BLACK',
				},
			},
		],
	}

	presets['mode-timer'] = {
		type: 'button',
		category: 'Mode',
		name: 'Timer',
		style: {
			text: 'TIMER',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'displayM',
						options: {
							mode: 'TIMER',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'mode_color',
				options: {
					bg: combineRgb(0, 0, 255),
					fg: combineRgb(255, 255, 255),
					mode: 'TIMER',
				},
			},
		],
	}

	presets['mode-clock'] = {
		type: 'button',
		category: 'Mode',
		name: 'Clock',
		style: {
			text: 'CLOCK',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'displayM',
						options: {
							mode: 'CLOCK',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'mode_color',
				options: {
					bg: combineRgb(0, 0, 255),
					fg: combineRgb(255, 255, 255),
					mode: 'CLOCK',
				},
			},
		],
	}

	presets['mode-test'] = {
		type: 'button',
		category: 'Mode',
		name: 'Test',
		style: {
			text: 'TEST',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'displayM',
						options: {
							mode: 'TEST',
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'mode_color',
				options: {
					bg: combineRgb(0, 0, 255),
					fg: combineRgb(255, 255, 255),
					mode: 'TEST',
				},
			},
		],
	}

	// Show timer
	presets['display-hours'] = {
		type: 'button',
		category: 'Display time',
		name: 'Hours',
		style: {
			text: '$(label:time_h)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: 6619136,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'state_color',
				options: {
					pause_fg: 16777215,
					pause_bg: 7954688,
					run_fg: 16777215,
					run_bg: 26112,
				},
			},
		],
	}

	presets['display-minutes'] = {
		type: 'button',
		category: 'Display time',
		name: 'Minutes',
		style: {
			text: '$(label:time_m)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: 6619136,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'state_color',
				options: {
					pause_fg: 16777215,
					pause_bg: 7954688,
					run_fg: 16777215,
					run_bg: 26112,
				},
			},
		],
	}

	presets['display-seconds'] = {
		type: 'button',
		category: 'Display time',
		name: 'Seconds',
		style: {
			text: '$(label:time_s)',
			size: 'auto',
			color: combineRgb(255, 255, 255),
			bgcolor: 6619136,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'state_color',
				options: {
					pause_fg: 16777215,
					pause_bg: 7954688,
					run_fg: 16777215,
					run_bg: 26112,
				},
			},
		],
	}

	return presets
}
