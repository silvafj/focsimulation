type NoamAutomaton = {
  states: Array<string>;
  alphabet: Array<string>;
  acceptingStates: Array<string>;
  initialState: string;
  transitions: Array<{
    fromState: string;
    toStates: Array<string>;
    symbol: string;
  }>;
  statePositions: Map<string, {
    x: number; y: number;
  }>;
  transitionPositions: Map<string, { a: number, b: number }>;
}

type AutomatonExample = {
  title: string;
  testWord: string;
  automaton: NoamAutomaton;
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
        's2',
      ],
      alphabet: [
        'a',
        'b',
      ],
      acceptingStates: [
        's2',
      ],
      initialState: 's0',
      transitions: [
        {
          fromState: 's0',
          toStates: [
            's1',
          ],
          symbol: 'a',
        },
        {
          fromState: 's1',
          toStates: [
            's2',
          ],
          symbol: 'b',
        },
        {
          fromState: 's2',
          toStates: [
            's1',
          ],
          symbol: 'a',
        },
      ],
      statePositions: new Map([
        ['s0', { x: 60, y: 60 }],
        ['s1', { x: 180, y: 60 }],
        ['s2', { x: 340, y: 60 }],
      ]),
      transitionPositions: new Map([
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
        'b',
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
            's1',
          ],
          symbol: 'a',
        },
        {
          fromState: 's0',
          toStates: [
            's2',
          ],
          symbol: 'b',
        },
        {
          fromState: 's1',
          toStates: [
            's2',
          ],
          symbol: 'b',
        },
        {
          fromState: 's2',
          toStates: [
            's1',
          ],
          symbol: 'a',
        },
      ],
      statePositions: new Map([
        ['s0', { x: 60, y: 60 }],
        ['s1', { x: 200, y: 180 }],
        ['s2', { x: 340, y: 60 }],
      ]),
      transitionPositions: new Map([
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
        'b',
      ],
      acceptingStates: [
        's5',
      ],
      initialState: 's0',
      transitions: [
        {
          fromState: 's3',
          toStates: [
            's3',
          ],
          symbol: 'a',
        },
        {
          fromState: 's3',
          toStates: [
            's4',
          ],
          symbol: 'b',
        },
        {
          fromState: 's5',
          toStates: [
            's5',
          ],
          symbol: 'b',
        },
        {
          fromState: 's4',
          toStates: [
            's3',
          ],
          symbol: 'a',
        },
        {
          fromState: 's0',
          toStates: [
            's1',
          ],
          symbol: 'a',
        },
        {
          fromState: 's1',
          toStates: [
            's2',
          ],
          symbol: 'b',
        },
        {
          fromState: 's4',
          toStates: [
            's5',
          ],
          symbol: 'b',
        },
        {
          fromState: 's5',
          toStates: [
            's3',
          ],
          symbol: 'a',
        },
        {
          fromState: 's2',
          toStates: [
            's3',
          ],
          symbol: 'a',
        },
      ],
      statePositions: new Map([
        ['s0', { x: 86, y: 145 }],
        ['s1', { x: 165, y: 80 }],
        ['s2', { x: 235, y: 145 }],
        ['s3', { x: 311, y: 80 }],
        ['s4', { x: 396, y: 145 }],
        ['s5', { x: 311, y: 231 }],
      ]),
      transitionPositions: new Map([
        ['s3-s3', { a: -1.6, b: 0 }],
        ['s5-s5', { a: 1.6, b: 0 }],
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
        'b',
      ],
      acceptingStates: [
        's2',
      ],
      initialState: 's0',
      transitions: [
        {
          fromState: 's1',
          toStates: [
            's3',
          ],
          symbol: 'b',
        },
        {
          fromState: 's3',
          toStates: [
            's1',
          ],
          symbol: 'b',
        },
        {
          fromState: 's0',
          toStates: [
            's2',
          ],
          symbol: 'b',
        },
        {
          fromState: 's2',
          toStates: [
            's0',
          ],
          symbol: 'b',
        },
        {
          fromState: 's2',
          toStates: [
            's3',
          ],
          symbol: 'a',
        },
        {
          fromState: 's3',
          toStates: [
            's2',
          ],
          symbol: 'a',
        },
        {
          fromState: 's0',
          toStates: [
            's1',
          ],
          symbol: 'a',
        },
        {
          fromState: 's1',
          toStates: [
            's0',
          ],
          symbol: 'a',
        },
      ],
      statePositions: new Map([
        ['s0', { x: 140, y: 80 }],
        ['s1', { x: 300, y: 80 }],
        ['s2', { x: 200, y: 220 }],
        ['s3', { x: 360, y: 220 }],
      ]),
      transitionPositions: new Map([
      ]),
    },
  },
  {
    title: 'contain every symbol at least once',
    testWord: 'abc',
    automaton:
    {
      states: [
        's',
        'a',
        'b',
        'c',
        'ab',
        'ac',
        'bc',
        'abc',
      ],
      alphabet: [
        'a',
        'b',
        'c',
      ],
      acceptingStates: [
        'abc',
      ],
      initialState: 's',
      transitions: [
        {
          fromState: 's',
          toStates: [
            'a',
          ],
          symbol: 'a',
        },
        {
          fromState: 's',
          toStates: [
            'b',
          ],
          symbol: 'b',
        },
        {
          fromState: 's',
          toStates: [
            'c',
          ],
          symbol: 'c',
        },
        {
          fromState: 'a',
          toStates: [
            'a',
          ],
          symbol: 'a',
        },
        {
          fromState: 'a',
          toStates: [
            'ab',
          ],
          symbol: 'b',
        },
        {
          fromState: 'a',
          toStates: [
            'ac',
          ],
          symbol: 'c',
        },
        {
          fromState: 'b',
          toStates: [
            'b',
          ],
          symbol: 'b',
        },
        {
          fromState: 'b',
          toStates: [
            'ab',
          ],
          symbol: 'a',
        },
        {
          fromState: 'b',
          toStates: [
            'bc',
          ],
          symbol: 'c',
        },
        {
          fromState: 'c',
          toStates: [
            'c',
          ],
          symbol: 'c',
        },
        {
          fromState: 'c',
          toStates: [
            'ac',
          ],
          symbol: 'a',
        },
        {
          fromState: 'c',
          toStates: [
            'bc',
          ],
          symbol: 'b',
        },
        {
          fromState: 'ab',
          toStates: [
            'ab',
          ],
          symbol: 'a',
        },
        {
          fromState: 'ab',
          toStates: [
            'ab',
          ],
          symbol: 'b',
        },
        {
          fromState: 'ab',
          toStates: [
            'abc',
          ],
          symbol: 'c',
        },
        {
          fromState: 'ac',
          toStates: [
            'ac',
          ],
          symbol: 'a',
        },
        {
          fromState: 'ac',
          toStates: [
            'ac',
          ],
          symbol: 'c',
        },
        {
          fromState: 'ac',
          toStates: [
            'abc',
          ],
          symbol: 'b',
        },
        {
          fromState: 'bc',
          toStates: [
            'bc',
          ],
          symbol: 'b',
        },
        {
          fromState: 'bc',
          toStates: [
            'bc',
          ],
          symbol: 'c',
        },
        {
          fromState: 'bc',
          toStates: [
            'abc',
          ],
          symbol: 'a',
        },
        {
          fromState: 'abc',
          toStates: [
            'abc',
          ],
          symbol: 'a',
        },
        {
          fromState: 'abc',
          toStates: [
            'abc',
          ],
          symbol: 'b',
        },
        {
          fromState: 'abc',
          toStates: [
            'abc',
          ],
          symbol: 'c',
        },

      ],
      statePositions: new Map([
        ['s', { x: 50, y: 200 }],
        ['b', { x: 200, y: 200 }],
        ['ac', { x: 350, y: 200 }],
        ['abc', { x: 500, y: 200 }],
        ['a', { x: 200, y: 50 }],
        ['ab', { x: 350, y: 50 }],
        ['c', { x: 200, y: 350 }],
        ['bc', { x: 350, y: 350 }],
      ]),
      transitionPositions: new Map([
        ['a-a', { a: -1.6, b: 0 }],
        ['b-b', { a: -1.6, b: 0 }],
        ['c-c', { a: -1.6, b: 0 }],
        ['ab-ab', { a: -1.6, b: 0 }],
        ['ac-ac', { a: -1.6, b: 0 }],
        ['bc-bc', { a: -1.6, b: 0 }],
      ]),
    },
  },
];
