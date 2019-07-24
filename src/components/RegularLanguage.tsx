import React from 'react';
import {
    Layout,
    Input,
} from 'antd';

import noam from 'noam';

import './RegularLanguage.css';

function generateAutomaton(expression: string, ref: React.Ref<HTMLDivElement>) {
    const automaton: any = noam.fsm.convertStatesToNumbers(
        noam.fsm.minimize(
            noam.fsm.convertNfaToDfa(
                noam.fsm.convertEnfaToNfa(
                    noam.re.string.toAutomaton(expression)))));
}

const RegularLanguage: React.FC = () => {

    const automatonRef: React.RefObject<HTMLDivElement> = React.createRef();

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
        console.log(noam);
        console.log(automatonRef);
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
            <div ref={automatonRef} />
        </Layout>
    );
}

export default RegularLanguage;
