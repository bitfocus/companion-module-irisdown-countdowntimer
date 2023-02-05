import { Regex } from '@companion-module/base'

export function getConfigFields() {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This module controls Countdown timer 2.0 by <a href="http://irisdown.co.uk" target="_new">Irisdown</a>. Go over to their website to download the program.',
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: Regex.IP,
		},
		{
			type: 'static-text',
			id: 'info',
			width: 6,
			label: 'Feedback',
			value:
				'This module has support for getting information about the timer back to companion. But this feature requires Countdown Timer version 2.0.9 or later.',
		},
	]
}
