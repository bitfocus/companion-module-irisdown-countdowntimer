export function compileVariableDefinitions() {
	return [
		{
			name: 'State of timer (Running, Paused, Stopped)',
			variableId: 'state',
		},
		{
			name: 'Mode of display (TIMER, CLOCK, BLACK, TEST)',
			variableId: 'mode',
		},
		{
			name: 'Current time of timer (hh:mm:ss)',
			variableId: 'time',
		},
		{
			name: 'Current time of timer (hh:mm)',
			variableId: 'time_hm',
		},
		{
			name: 'Current time of timer (hours)',
			variableId: 'time_h',
		},
		{
			name: 'Current time of timer (minutes)',
			variableId: 'time_m',
		},
		{
			name: 'Current time of timer (seconds)',
			variableId: 'time_s',
		},
	]
}
