import React from 'react';
import {
    Layout,
    Input,
} from 'antd';

import noam from 'noam';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import './RegularLanguage.css';

function clearAutomaton(target: React.RefObject<HTMLDivElement>): void {
    if (target.current != null) {
        while (target.current.firstChild) {
            target.current.removeChild(target.current.firstChild);
        }
    }
}

function generateAutomaton(expression: string, target: React.RefObject<HTMLDivElement>): void {
    clearAutomaton(target);
    if (!expression) {
        return;
    }

    const automaton: any = noam.fsm.convertStatesToNumbers(
        noam.fsm.minimize(
            noam.fsm.convertNfaToDfa(
                noam.fsm.convertEnfaToNfa(
                    noam.re.string.toAutomaton(expression)))));

    const dotString: string = noam.fsm.printDotFormat(automaton);

    const viz = new Viz({ Module, render });
    viz.renderSVGElement(dotString)
        .then((svgElement) => {
            if (target.current != null) {
                target.current.appendChild(svgElement);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

const RegularLanguage: React.FC = () => {

    const automatonRef: React.RefObject<HTMLDivElement> = React.createRef();

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        generateAutomaton(event.target.value, automatonRef);
    }

    return (
        <Layout>
            <h1>Regular language</h1>
            <Input size="large" placeholder="What is your regular language expression?" onChange={onChange} />
            <h1>Test strings</h1>
            <div className="field accept">
                <h2>Accept</h2>
                <Input.TextArea rows={8} />
            </div>
            <div className="field reject">
                <h2>Reject</h2>
                <Input.TextArea rows={8} />
            </div>
            <div className="automaton" ref={automatonRef} />
        </Layout>
    );
}

export default RegularLanguage;
