import React, { useState } from 'react';
import {
    Dropdown,
    Icon,
    Input,
    Layout,
    Menu,
    Popover,
    Tooltip,
} from 'antd';
import { ClickParam } from "antd/lib/menu"

import noam from 'noam';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

import './RegularLanguage.css';

function isValidAutomaton(automaton: any): boolean {
    return automaton && automaton.transitions.length > 0;
}

function generateAutomaton(expression: string): any {
    try {
        const automaton = noam.fsm.convertStatesToNumbers(
            noam.fsm.minimize(
                noam.fsm.convertNfaToDfa(
                    noam.fsm.convertEnfaToNfa(
                        noam.re.string.toAutomaton(expression)))));

        return [automaton, null];
    } catch (error) {
        if (error.name === "RegexError") {
            return [null, error];
        }
    }

    return;
}


function testWords(automaton: any, words: Array<string>, expected: boolean): string {
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

function renderAutomaton(automaton: any, automatonParent: React.RefObject<HTMLDivElement>): void {
    if (!isValidAutomaton(automaton)) {
        return;
    }

    (new Viz({ Module, render }))
        .renderSVGElement(noam.fsm.printDotFormat(automaton))
        .then((svgElement) => {
            if (!automatonParent.current) {
                return;
            }

            while (automatonParent.current.firstChild) {
                automatonParent.current.removeChild(automatonParent.current.firstChild);
            }

            if (isValidAutomaton(automaton)) {
                automatonParent.current.appendChild(svgElement);
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function renderExpressionHelp() {
    const title = <span>What is a regular expression?</span>;
    const content = (
        <div>
            <p>A regular expression (over an alphabet Σ) is a string consisting of symbols from Σ, plus symbols from the list <em>+</em>, <em>*</em>, <em>(</em>, <em>)</em>, <em>$</em>.</p>
            <ul>
                <li><strong>+</strong> (alteration operator, ∪)</li>
                <li><strong>∗</strong> (Kleene star); 0 or more symbols</li>
                <li><strong>(</strong>; start grouping</li>
                <li><strong>)</strong>; end grouping</li>
                <li><strong>$</strong> (epsilon, ε); empty string</li>
                <li><strong>\</strong> (backslash); used for escaping the special meaning of all the listed characters, including backslash itself</li>
            </ul>

            <p>Example: <code>a(a+b)*</code></p>
            <p>= all words starting with a, followed by any word over {'{a, b}'}</p>
            <p>= all words over the alphabet {'{a, b}'} starting with a</p>
        </div>
    );

    return (
        <Popover placement="rightTop" title={title} content={content}>
            <Icon type="question-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
        </Popover>);
}

function renderExpressionStatus(error: any) {
    if (!error) {
        return (<span></span>);
    }

    return (
        <Tooltip placement="topRight" title={error.message}>
            <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
        </Tooltip>
    );
}

enum ExpressionMenuOp {
    RANDOM = "random",
    SIMPLIFY = "simplify",
}

function renderExpressionMenu(onClick: (param: ClickParam) => void) {
    const menu = (
        <Menu onClick={onClick}>
            <Menu.Item key={ExpressionMenuOp.RANDOM}>Generate random expression</Menu.Item>
            <Menu.Item key={ExpressionMenuOp.SIMPLIFY}>Simplify expression</Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
            <Icon type="menu" />
        </Dropdown>);
}

const RegularLanguage: React.FC = () => {
    const [expression, setExpression] = useState('');
    const [acceptWords, setAcceptWords] = useState('');
    const [rejectWords, setRejectWords] = useState('');

    const automatonParent: React.RefObject<HTMLDivElement> = React.createRef();

    const handleExpressionMenuClick = (click: ClickParam) => {
        switch (click.key) {
            case ExpressionMenuOp.RANDOM: {
                setExpression(
                    noam.re.string.simplify(
                        noam.re.string.random(5, "ab", {})));
                break;
            }
            case ExpressionMenuOp.SIMPLIFY: {
                setExpression(noam.re.string.simplify(expression));
                break;
            }
        }
    }

    const [automaton, error] = generateAutomaton(expression);
    renderAutomaton(automaton, automatonParent);

    return (
        <Layout>
            <h1>Expression</h1>
            <Input size="large" placeholder="Write your regular expression"
                value={expression}
                prefix={renderExpressionHelp()}
                suffix={renderExpressionStatus(error)}
                addonAfter={renderExpressionMenu(handleExpressionMenuClick)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpression(event.target.value)}
            />
            <h1>Words</h1>
            <div className="field accept">
                <h2>Accept</h2>

                <div className="ht-container">
                    <div className="ht-backdrop">
                        <div className="ht-highlights" dangerouslySetInnerHTML={{
                            __html:
                                testWords(automaton, acceptWords.split('\n'), true)
                        }}>
                        </div>
                    </div>
                    <Input.TextArea rows={8}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setAcceptWords(event.target.value)}
                    />
                </div>
            </div>
            <div className="field reject">
                <h2>Reject</h2>
                <div className="ht-container">
                    <div className="ht-backdrop">
                        <div className="ht-highlights" dangerouslySetInnerHTML={{
                            __html:
                                testWords(automaton, rejectWords.split('\n'), false)
                        }}>
                        </div>
                    </div>
                    <Input.TextArea rows={8}
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setRejectWords(event.target.value)}
                    />
                </div>
            </div>
            <h1>Deterministic Finite Automaton</h1>
            <div className="automaton" ref={automatonParent} />
        </Layout>
    );
}

export default RegularLanguage;
