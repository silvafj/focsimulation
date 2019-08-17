import React, { useState, useMemo } from 'react';
import {
    Dropdown,
    Icon,
    Input,
    Layout,
    Menu,
    Tooltip,
    Button,
} from 'antd';
import { ClickParam } from "antd/lib/menu"
import SubMenu from 'antd/lib/menu/SubMenu';

import noam from 'noam';

import TestWords from '../../components/test-words';
import AutomatonViewer from '../../components/automaton-viewer';
import ExpressionHelp from '../../components/regular-expression';
import { Examples } from './examples';

import './regular-language.css';

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

enum ExpressionMenuOp {
    RANDOM = "random",
    SIMPLIFY = "simplify",
}

export const RegularLanguage: React.FC = () => {
    const [expression, setExpression] = useState('');
    const [acceptWords, setAcceptWords] = useState<Array<string>>([]);
    const [rejectWords, setRejectWords] = useState<Array<string>>([]);

    // Avoid generating a new automaton between renders for the same expression
    const [automaton, error] = useMemo(() => generateAutomaton(expression), [expression]);

    const handleExpressionMenuClick = (click: ClickParam) => {
        switch (click.key) {
            case ExpressionMenuOp.RANDOM: {
                setExpression(
                    noam.re.string.simplify(
                        noam.re.string.random(5, "ab", {})));
                break;
            }
            case ExpressionMenuOp.SIMPLIFY: {
                /** TODO:
                 * write the simplify steps to the log
                 * allow debugging the simplification with step forward and explanation
                 */
                setExpression(noam.re.string.simplify(expression));
                break;
            }
        }

        if (click.key.startsWith('example')) {
            const index = Number(click.key.split('-')[1]);
            setExpression(Examples[index].expression);
            setAcceptWords(Examples[index].acceptWords);
            setRejectWords(Examples[index].rejectWords);
        }
    }

    return (
        <Layout>
            <h1>Expression</h1>
            <div className="toolbar">
                <Dropdown
                    placement="bottomLeft"
                    trigger={['click']}
                    overlay={
                        <Menu onClick={handleExpressionMenuClick}>
                            <Menu.Item key={ExpressionMenuOp.RANDOM}>Generate random expression</Menu.Item>
                            <Menu.Item key={ExpressionMenuOp.SIMPLIFY}>Simplify expression</Menu.Item>
                            <SubMenu title="Examples">
                                {
                                    Examples.map((v, i) => <Menu.Item key={`example-${i}`}>{v.title}</Menu.Item>)
                                }
                            </SubMenu>
                        </Menu>
                    }>
                    <Button icon="menu" size="large" />
                </Dropdown>

                <Input size="large" placeholder="Write your regular expression"
                    value={expression}
                    prefix={ExpressionHelp}
                    suffix={
                        <Tooltip placement="topRight" title={error ? error.message : ''}>
                            <Icon type="close" style={{ color: 'red', display: (!error ? 'none' : 'inherit') }} />
                        </Tooltip>
                    }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpression(event.target.value)}
                />
            </div>
            <h1>Words</h1>
            <TestWords automaton={automaton} words={acceptWords} testAccept={true} onChange={words => setAcceptWords(words)} />
            <TestWords automaton={automaton} words={rejectWords} testAccept={false} onChange={words => setRejectWords(words)} />
            <h1>Deterministic Finite Automaton</h1>
            <AutomatonViewer automaton={automaton} />
        </Layout>
    );
}