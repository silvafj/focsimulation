type NoamAutomaton = {
    states: Array<string>,
    alphabet: Array<string>,
    acceptingStates: Array<string>,
    initialState: string,
    transitions: Array<{
        fromState: string,
        toStates: Array<string>,
        symbol: string
    }>,
    statePositions: Map<string, {
        x: number, y: number
    }>,
    transitionAngles: Map<string, number>,
}

type AutomatonExample = {
    title: string,
    testWord: string,
    automaton: NoamAutomaton,
}

export const Examples: Array<AutomatonExample> = [
    {
        title: 'one or more "ab"',
        testWord: 'ababab',
        automaton:
        {
            states: [
                's0',
                's1',
                's2'
            ],
            alphabet: [
                'a',
                'b'
            ],
            acceptingStates: [
                's2'
            ],
            initialState: 's0',
            transitions: [
                {
                    fromState: 's0',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's1',
                    toStates: [
                        's2'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's2',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                }
            ],
            statePositions: new Map([
                ['s0', { x: 60, y: 60 }],
                ['s1', { x: 180, y: 60 }],
                ['s2', { x: 340, y: 60 }],
            ]),
            transitionAngles: new Map([
            ]),
        },
    },
    {
        title: 'strictly alternating a\'s and b\'s',
        testWord: 'abababababababab',
        automaton:
        {
            states: [
                's0',
                's1',
                's2',
            ],
            alphabet: [
                'a',
                'b'
            ],
            acceptingStates: [
                's0',
                's1',
                's2',
            ],
            initialState: 's0',
            transitions: [
                {
                    fromState: 's0',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's0',
                    toStates: [
                        's2'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's1',
                    toStates: [
                        's2'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's2',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                }
            ],
            statePositions: new Map([
                ['s0', { x: 60, y: 60 }],
                ['s1', { x: 200, y: 180 }],
                ['s2', { x: 340, y: 60 }],
            ]),
            transitionAngles: new Map([
            ]),
        },
    },
    {
        title: 'begin with "aba" and end with "bb"',
        testWord: 'ababbababb',
        automaton:
        {
            states: [
                's0',
                's1',
                's2',
                's3',
                's4',
                's5',
            ],
            alphabet: [
                'a',
                'b'
            ],
            acceptingStates: [
                's5',
            ],
            initialState: 's0',
            transitions: [
                {
                    fromState: 's3',
                    toStates: [
                        's3'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's3',
                    toStates: [
                        's4'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's5',
                    toStates: [
                        's5'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's4',
                    toStates: [
                        's3'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's0',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's1',
                    toStates: [
                        's2'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's4',
                    toStates: [
                        's5'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's5',
                    toStates: [
                        's3'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's2',
                    toStates: [
                        's3'
                    ],
                    symbol: 'a'
                }
            ],
            statePositions: new Map([
                ['s0', { x: 86, y: 145 }],
                ['s1', { x: 165, y: 80 }],
                ['s2', { x: 235, y: 145 }],
                ['s3', { x: 311, y: 80 }],
                ['s4', { x: 396, y: 145 }],
                ['s5', { x: 311, y: 231 }],
            ]),
            transitionAngles: new Map([
                ['s3-s3', -1.6],
                ['s5-s5', 1.6],
            ]),
        },
    },
    {
        title: 'even number of a\'s and odd number of b\'s',
        testWord: 'aababab',
        automaton:
        {
            states: [
                's0',
                's1',
                's2',
                's3',
            ],
            alphabet: [
                'a',
                'b'
            ],
            acceptingStates: [
                's2',
            ],
            initialState: 's0',
            transitions: [
                {
                    fromState: 's1',
                    toStates: [
                        's3'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's3',
                    toStates: [
                        's1'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's0',
                    toStates: [
                        's2'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's2',
                    toStates: [
                        's0'
                    ],
                    symbol: 'b'
                },
                {
                    fromState: 's2',
                    toStates: [
                        's3'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's3',
                    toStates: [
                        's2'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's0',
                    toStates: [
                        's1'
                    ],
                    symbol: 'a'
                },
                {
                    fromState: 's1',
                    toStates: [
                        's0'
                    ],
                    symbol: 'a'
                },
            ],
            statePositions: new Map([
                ['s0', { x: 140, y: 80 }],
                ['s1', { x: 300, y: 80 }],
                ['s2', { x: 200, y: 220 }],
                ['s3', { x: 360, y: 220 }],
            ]),
            transitionAngles: new Map([
            ]),
        },
    },
];