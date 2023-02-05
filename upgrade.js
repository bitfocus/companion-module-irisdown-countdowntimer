import { CreateConvertToBooleanFeedbackUpgradeScript } from '@companion-module/base'

export const UpgradeScripts = [
	CreateConvertToBooleanFeedbackUpgradeScript({
		mode_color: true,
		message_on: {
			run_fg: 'color',
			run_bg: 'bgcolor',
		},
	}),
]
