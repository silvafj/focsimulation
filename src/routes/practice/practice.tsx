import React from 'react';
import { Layout } from 'antd';
import Quiz from 'react-quiz-component';

import './practice.css';

/**
 * Questions have been obtained from https://www.geeksforgeeks.org/regular-languages-and-finite-automata-gq/
 */
const questions = {
    "quizTitle": "Let's practice regular language and automata",
    "quizSynopsis": "A small set of practice questions about regular language and automata...",
    "questions": [
        {
            "question": "Given the language `L={ab,aa,baa}` which of the following strings are in `L*`?",
            "questionType": "text",
            "answerSelectionType": "multiple",
            "answers": [
                "abaabaaabaa",
                "aaaabaaaa",
                "baaaaabaaaab",
                "baaaaabaa"
            ],
            "correctAnswer": [1, 2, 4],
            "messageForCorrectAnswer": "Correct answer.",
            "messageForIncorrectAnswer": "Incorrect answer.",
            "explanation": [
                "Any combination of strings in set {ab, aa, baa} will be in L*. ",
                "\"abaabaaabaa\" can be partitioned as \"ab aa baa ab aa\", ",
                "\"aaaabaaaa\" as \"aa ab aa aa\", and ",
                "\"baaaaabaa\" as \"baa aa ab aa\".",
            ],
            "point": "1"
        },
        {
            "question": "The definition of a language `L` with alphabet `{a}` is given as following `L={a^nk| k>0, and n is a positive integer constant}`.\nWhat is the minimum number of states needed in DFA to recognize L?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": [
                "k + 1",
                "n + 1",
                "2^(n + 1)",
                "2^(k + 1)"
            ],
            "correctAnswer": "2",
            "messageForCorrectAnswer": "Correct answer.",
            "messageForIncorrectAnswer": "Incorrect answer.",
            "explanation": [
                "Note that n is a constant and k is any positive integer. ",
                "For example, if n is given as 3, then the DFA must be able to accept 3a, 6a, 9a, 12a, etc ",
                "To build such a DFA, we need 4 states."
            ],
            "point": "1"
        },
        {
            "question": "Let `w` be any string of length `n` is `{0,1}*`. Let `L` be the set of all substrings of `w`. What is the minimum number of states in a non-deterministic finite automaton that accepts `L`?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": [
                "n - 1",
                "n",
                "n + 1",
                "2n -1"
            ],
            "correctAnswer": "3",
            "messageForCorrectAnswer": "Correct answer.",
            "messageForIncorrectAnswer": "Incorrect answer.",
            "explanation": [
                "We need minimum n + 1 states to build NFA that accepts all substrings of a binary string.",
            ],
            "point": "1"
        },
        {
            "question": "Which one of the following languages over the alphabet `{0,1}` is described by the regular expression `(0+1)*0(0+1)*0(0+1)*`?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": [
                "Set of all strings containing the substring 00",
                "Set of all strings containing at most two 0's",
                "Set of all strings containing at least two 0's",
                "Set of all strings that begin and end with either 0 or 1"
            ],
            "correctAnswer": "3",
            "messageForCorrectAnswer": "Correct answer.",
            "messageForIncorrectAnswer": "Incorrect answer.",
            "explanation": [
                "The regular expression has two 0's surrounded by (0+1)* which means accepted strings must have at least two 0′s.",
            ],
            "point": "1"
        },
        {
            "question": "Which one of the following is FALSE?",
            "questionType": "text",
            "answerSelectionType": "single",
            "answers": [
                "There is unique minimal DFA for every regular language",
                "Every NFA can be converted to an equivalent PDA",
                "Complement of every context-free language is recursive",
                "Every nondeterministic PDA can be converted to an equivalent deterministic PDA"
            ],
            "correctAnswer": "4",
            "messageForCorrectAnswer": "Correct answer.",
            "messageForIncorrectAnswer": "Incorrect answer.",
            "explanation": [
                "Power of Deterministic PDA is not same as the power of Non-deterministic PDA. ",
                "Deterministic PDA cannot handle languages or grammars with ambiguity, but NDPDA ",
                "can handle languages with ambiguity and any context-free grammar. ",
                "So every non-deterministic PDA can not be converted to an equivalent deterministic PDA.",
            ],
            "point": "1"
        },
    ]
}


export const Practice: React.FC = () => {

    // TODO: improve this quiz with images, runtime generation of math formulas
    // allow answers to be tested in real time, show the state machine, etc

    return (
        <Layout>
            <Quiz quiz={questions} shuffle={false} showInstantFeedback={true} />
        </Layout>
    );
}