type ExpressionExample = {
    title: string,
    expression: string,
    acceptWords: Array<string>,
    rejectWords: Array<string>,
}

export const Examples: Array<ExpressionExample> = [
    {
        title: 'one or more "ab"',
        expression: 'ab(ab)*',
        acceptWords: [
            'ab',
            'abab',
            'ababab',
        ],
        rejectWords: [
            'a',
            'b',
            'aba',
            'ba',
            'bb',
            'ababb',
        ],
    },
    {
        title: 'strictly alternating a\'s and b\'s',
        expression: '(ab)*(a+$)+(ba)*(b+$)',
        acceptWords: [
            'a',
            'b',
            'ab',
            'ba',
            'aba',
            'bab',
            'abab',
            'baba',
        ],
        rejectWords: [
            'bb',
            'aa',
            'abba',
        ],
    },
    {
        title: 'begin with "aba" and end with "bb"',
        expression: 'aba(a+b)*bb',
        acceptWords: [
            'ababb',
            'ababb',
            'ababbb',
            'ababbababb',
        ],
        rejectWords: [
            'aba',
            'abab',
            'abb',
        ],
    },
    {
        title: 'groups of 2 or more a\'s',
        expression: '(b+(aaa*))*',
        acceptWords: [
            'b',
            'bbbb',
            'aa',
            'aaa',
            'aabaaabbaa',
            'bbaabaaabaabaaa',
        ],
        rejectWords: [
            'a',
            'aba',
            'abba',
            'aabaaaaba',
        ],
    },
    {
        title: 'start with "a" and not contain "cb"',
        expression: 'a(a+b+cc*a)*(cc*+$)',
        acceptWords: [
            'a',
            'ab',
            'abc',
            'ac',
            'acc',
            'accab',
        ],
        rejectWords: [
            'b',
            'c',
            'acb',
            'abbabcba',
        ],
    },
    {
        title: 'even number of a\'s and odd number of b\'s',
        expression: '(aa+bb+abba+baab+abab+baba)*(aba+b)(aa+bb+abba+baab+abab+baba)*',
        acceptWords: [
            'b',
            'aab',
            'baa',
            'aba',
            'aaaba',
            'aababab',
        ],
        rejectWords: [
            'aa',
            'abba',
            'abbbabab',
        ],
    },
];