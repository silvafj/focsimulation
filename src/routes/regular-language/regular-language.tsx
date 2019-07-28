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

import TestWords from '../../components/test-words';
import Automaton from '../../components/automaton';
import ExpressionHelp from '../../components/regular-expression';

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

    const handleExpressionMenuClick = (click: ClickParam) => {
        switch (click.key) {
            case ExpressionMenuOp.RANDOM: {
                setExpression(
                    noam.re.string.simplify(
                        noam.re.string.random(5, "ab", {})));
                break;
            }
            case ExpressionMenuOp.SIMPLIFY: {
                // TODO: write the simplify steps to the log
                setExpression(noam.re.string.simplify(expression));
                break;
            }
        }
    }

    const [automaton, error] = generateAutomaton(expression);

    return (
        <Layout>
            <h1>Expression</h1>
            <Input size="large" placeholder="Write your regular expression"
                value={expression}
                prefix={ExpressionHelp}
                suffix={
                    <Tooltip placement="topRight" title={error ? error.message : ''}>
                        <Icon type="close-circle" theme="filled" style={{ color: 'red', display: (!error ? 'none' : 'inherit') }} />
                    </Tooltip>
                }
                addonAfter={
                    <Dropdown
                        placement="bottomRight"
                        trigger={['click']}
                        overlay={
                            <Menu onClick={handleExpressionMenuClick}>
                                <Menu.Item key={ExpressionMenuOp.RANDOM}>Generate random expression</Menu.Item>
                                <Menu.Item key={ExpressionMenuOp.SIMPLIFY}>Simplify expression</Menu.Item>
                            </Menu>
                        }>
                        <Icon type="menu" />
                    </Dropdown>
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setExpression(event.target.value)}
            />
            <h1>Words</h1>
            <TestWords automaton={automaton} testAccept={true} />
            <TestWords automaton={automaton} testAccept={false} />
            <h1>Deterministic Finite Automaton</h1>
            <Automaton automaton={automaton} />
        </Layout>
    );
}