type ExpressionExample = {
    title: string,
    expression: string,
    acceptWords: Array<string>,
    rejectWords: Array<string>,
}

export const Examples: Array<ExpressionExample> = [
    {
        title: 'ab',
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
    }
];