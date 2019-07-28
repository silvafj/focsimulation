import React, { useState } from 'react';
import { Input } from 'antd';
import noam from 'noam';

import './test-words.css';

function isValidAutomaton(automaton: any): boolean {
    return automaton && automaton.transitions.length > 0;
}

function renderResultsHTML(automaton: any, words: Array<string>, expected: boolean): string {
    var results: Array<string> = [];

    if (!isValidAutomaton(automaton)) {
        return '';
    }

    for (let str of words) {
        var strState: string = expected ? 'invalid' : 'valid';

        try {
            if (noam.fsm.isStringInLanguage(automaton, str)) {
                strState = expected ? 'valid' : 'invalid';
            }
        } catch {
            //
        }

        results.push('<span class="' + strState + '">' + str + '</span>');
    }

    return results.join('');
}

export const TestWords: React.FC<{ automaton: any, testAccept: boolean }> = ({ automaton, testAccept }) => {
    const [words, setWords] = useState('');

    const testType: string = (testAccept ? 'Accept' : 'Reject');

    return (
        <div className={'test-words ' + testType.toLowerCase()}>
            <h2>{testType}</h2>

            <div className="container">
                <div className="backdrop">
                    <div className="highlights" dangerouslySetInnerHTML={{
                        __html:
                            renderResultsHTML(automaton, words.split('\n'), testAccept)
                    }}>
                    </div>
                </div>
                <Input.TextArea rows={8}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setWords(event.target.value)}
                />
            </div>
        </div>
    );
}