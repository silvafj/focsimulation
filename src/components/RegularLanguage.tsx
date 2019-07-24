import React, { useState } from 'react';
import {
    Layout,
    Input,
} from 'antd';

import noam from 'noam';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import './RegularLanguage.css';

function generateAutomaton(expression: string): any {
    return noam.fsm.convertStatesToNumbers(
        noam.fsm.minimize(
            noam.fsm.convertNfaToDfa(
                noam.fsm.convertEnfaToNfa(
                    noam.re.string.toAutomaton(expression)))));
}

function testStrings(automaton: any, strings: Array<string>, expected: boolean): string {
    var results: Array<string> = [];

    if (automaton.transitions.length === 0) {
        return '';
    }

    for (let str of strings) {
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

function renderAutomaton(automaton: any, automatonParent: React.RefObject<HTMLDivElement>): void {
    (new Viz({ Module, render }))
        .renderSVGElement(noam.fsm.printDotFormat(automaton))
        .then((svgElement) => {
            if (!automatonParent.current) {
                return;
            }

            while (automatonParent.current.firstChild) {
                automatonParent.current.removeChild(automatonParent.current.firstChild);
            }

            if (automaton.transitions.length === 0) {
                return;
            }

            automatonParent.current.appendChild(svgElement);
        })
        .catch(error => {
            console.error(error);
        });
}

const RegularLanguage: React.FC = () => {
    const [expression, setExpression] = useState('');
    const [acceptStrings, setAcceptStrings] = useState('');
    const [rejectStrings, setRejectStrings] = useState('');

    const acceptBackdrop: React.RefObject<HTMLDivElement> = React.createRef();
    const rejectBackdrop: React.RefObject<HTMLDivElement> = React.createRef();
    const automatonParent: React.RefObject<HTMLDivElement> = React.createRef();

    const automaton: any = generateAutomaton(expression);
    renderAutomaton(automaton, automatonParent);

    return (
        <Layout>
            <h1>Regular language</h1>
            <Input size="large" placeholder="What is your regular language expression?"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpression(event.target.value)} />
            <h1>Test strings</h1>
            <div className="field accept">
                <h2>Accept</h2>

                <div className="ht-container">
                    <div className="ht-backdrop" ref={acceptBackdrop}>
                        <div className="ht-highlights" dangerouslySetInnerHTML={{
                            __html:
                                testStrings(automaton, acceptStrings.split('\n'), true)
                        }}>
                        </div>
                    </div>
                    <Input.TextArea rows={8}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setAcceptStrings(event.target.value)}
                    />
                </div>
            </div>
            <div className="field reject">
                <h2>Reject</h2>
                <div className="ht-container">
                    <div className="ht-backdrop" ref={rejectBackdrop}>
                        <div className="ht-highlights" dangerouslySetInnerHTML={{
                            __html:
                                testStrings(automaton, rejectStrings.split('\n'), false)
                        }}>
                        </div>
                    </div>
                    <Input.TextArea rows={8}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setRejectStrings(event.target.value)}
                    />
                </div>
            </div>
            <div className="automaton" ref={automatonParent} />
        </Layout>
    );
}

export default RegularLanguage;
