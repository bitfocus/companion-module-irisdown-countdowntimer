module.exports = {

		/**
		* Get the available presets.
		*
		* @returns {Object[]} the available feedbacks
		* @access public
		* @since 1.1.0
		*/

		getPresets(updates) {
			var presets = [];

			presets.push({
				category: 'Timer control',
				label: 'GO',
				bank: {
					style: 'text',
					text: 'GO',
					size: '24',
					color: '16777215',
					bgcolor: this.rgb(0, 255, 0),
				},
				actions: [
					{
						action: 'go',
					},
				]
			});

			presets.push({
				category: 'Timer control',
				label: 'Pause',
				bank: {
					style: 'text',
					text: 'PAUSE',
					size: '18',
					color: this.rgb(0,0,0),
					bgcolor: this.rgb(255,255,0)
				},
				actions: [
					{
						action: 'pause',
					}
				]
			});

			presets.push({
				category: 'Timer control',
				label: '+1 minute',
				bank: {
					style: 'text',
					text: '+1 min',
					size: '18',
					color: this.rgb(0,0,0),
					bgcolor: this.rgb(255,255,0)
				},
				actions: [
					{
						action: 'jog',
						options: {
							minutes: '1',
						}
					}
				]
			});

			presets.push({
				category: 'Timer control',
				label: '-1 minute',
				bank: {
					style: 'text',
					text: '-1 min',
					size: '18',
					color: this.rgb(0,0,0),
					bgcolor: this.rgb(255,255,0)
				},
				actions: [
					{
						action: 'jog',
						options: {
							minutes: '-1',
						}
					}
				]
			});

			presets.push({
				category: 'Timer control',
				label: 'Reset',
				bank: {
					style: 'text',
					text: 'RESET',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,255)
				},
				actions: [
					{
						action: 'reset',
					}
				]
			});

			presets.push({
				category: 'Timer control',
				label: 'Set 5 min',
				bank: {
					style: 'text',
					text: 'SET\\n5 MIN',
					size: '18',
					color: '16777215',
					bgcolor: this.rgb(0,0,255)
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
				category: 'Timer control',
				label: 'Set 10 min',
				bank: {
					style: 'text',
					text: 'SET\\n10 MIN',
					size: '18',
					color: '16777215',
					bgcolor: this.rgb(0,0,255)
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
				category: 'Timer control',
				label: 'Set 15 min',
				bank: {
					style: 'text',
					text: 'SET\\n15 MIN',
					size: '18',
					color: '16777215',
					bgcolor: this.rgb(0,0,255)
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
				category: 'Mode',
				label: 'Black',
				bank: {
					style: 'text',
					text: 'BLACK',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'displayM',
						options: {
							mode: 'BLACK',
						}
					}
				],
				feedbacks: [
					{
						type: 'mode_color',
						options: {
							bg: this.rgb(0,0,255),
							fg: this.rgb(255,255,255),
							mode: 'BLACK'
						}
					}
				]
			});

			presets.push({
				category: 'Mode',
				label: 'Timer',
				bank: {
					style: 'text',
					text: 'TIMER',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'displayM',
						options: {
							mode: 'TIMER',
						}
					}
				],
				feedbacks: [
					{
						type: 'mode_color',
						options: {
							bg: this.rgb(0,0,255),
							fg: this.rgb(255,255,255),
							mode: 'TIMER'
						}
					}
				]
			});

			presets.push({
				category: 'Mode',
				label: 'Clock',
				bank: {
					style: 'text',
					text: 'CLOCK',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'displayM',
						options: {
							mode: 'CLOCK',
						}
					}
				],
				feedbacks: [
					{
						type: 'mode_color',
						options: {
							bg: this.rgb(0,0,255),
							fg: this.rgb(255,255,255),
							mode: 'CLOCK'
						}
					}
				]
			});

			presets.push({
				category: 'Mode',
				label: 'Test',
				bank: {
					style: 'text',
					text: 'TEST',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'displayM',
						options: {
							mode: 'TEST',
						}
					}
				],
				feedbacks: [
					{
						type: 'mode_color',
						options: {
							bg: this.rgb(0,0,255),
							fg: this.rgb(255,255,255),
							mode: 'TEST'
						}
					}
				]
			});

			if (updates) {
				// Show timer
				presets.push({
					category: 'Display time',
					label: 'Hours',
					bank: {
						style: 'text',
						text: '$(label:time_h)',
						size: 'auto',
						color: this.rgb(255,255,255),
						bgcolor: 6619136
					},
					actions: [],
					feedbacks: [
						{
							options: {
								pause_fg: 16777215,
								pause_bg: 7954688,
								run_fg: 16777215,
								run_bg: 26112
							},
							type: "state_color",
						}
					]
				});

				presets.push({
					category: 'Display time',
					label: 'Minutes',
					bank: {
						style: 'text',
						text: '$(label:time_m)',
						size: 'auto',
						color: this.rgb(255,255,255),
						bgcolor: 6619136
					},
					actions: [],
					feedbacks: [
						{
							options: {
								pause_fg: 16777215,
								pause_bg: 7954688,
								run_fg: 16777215,
								run_bg: 26112
							},
							type: "state_color",
						}
					]
				});

				presets.push({
					category: 'Display time',
					label: 'Seconds',
					bank: {
						style: 'text',
						text: '$(label:time_s)',
						size: 'auto',
						color: this.rgb(255,255,255),
						bgcolor: 6619136
					},
					actions: [],
					feedbacks: [
						{
							options: {
								pause_fg: 16777215,
								pause_bg: 7954688,
								run_fg: 16777215,
								run_bg: 26112
							},
							type: "state_color",
						}
					]
				});
			}
			return presets;
		}
};
