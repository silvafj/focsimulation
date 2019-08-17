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
        title: 'DFA ab',
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
                ['s0-s1', 0],
                ['s1-s2', 0],
                ['s2-s1', 0],
                ['s2-s3', 0],
                ['s3-s2', 0],
            ]),
        },
    },
];




