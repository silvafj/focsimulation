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

function testStrings(automaton: any, accept: Array<string>, reject: Array<string>): void {
    if (automaton.transitions.length === 0) {
        return;
    }

    for (let str of accept) {
        try {
            console.log(noam.fsm.isStringInLanguage(automaton, str));
        } catch {
            console.log(false);
        }
        
    }
    console.log(accept, reject);
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

    const automatonParent: React.RefObject<HTMLDivElement> = React.createRef();

    const automaton: any = generateAutomaton(expression);
    renderAutomaton(automaton, automatonParent);
    testStrings(automaton, acceptStrings.split('\n'), rejectStrings.split('\n'));

    return (
        <Layout>
            <h1>Regular language</h1>
            <Input size="large" placeholder="What is your regular language expression?"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpression(event.target.value)} />
            <h1>Test strings</h1>
            <div className="field accept">
                <h2>Accept</h2>
                <Input.TextArea rows={8}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setAcceptStrings(event.target.value)} />
            </div>
            <div className="field reject">
                <h2>Reject</h2>
                <Input.TextArea rows={8}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setRejectStrings(event.target.value)} />
            </div>
            <div className="automaton" ref={automatonParent} />
        </Layout>
    );
}

export default RegularLanguage;
