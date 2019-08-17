import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';
import { Input, Button, Tooltip, Icon, Dropdown } from 'antd';
import Menu, { ClickParam } from 'antd/lib/menu';
import SubMenu from 'antd/lib/menu/SubMenu';
import noam from 'noam';
import clone from 'clone';

import { Edge } from './edge/edge';
import { Node } from './node/node';
import { Help } from './help/help';
import {
    getStateFromElement,
    getMousePosition,
    getStatePosition,
    getTransitionFromElement,
    groupByTransitions,
    updateTransitions,
    addState,
    removeState,
    setAcceptingState,
    getNextState,
    removeTransition
} from './helpers';
import { Examples } from './examples';
import { Point, angleOfLine } from '../../utils/math';

import './automaton-designer.css';

type DebuggingMode = {
    currentStates: Array<string>,
    testWord: string,
    nextSymbolIndex: number,
    iteratingUntilEnd: Boolean,
};

enum ObjectType { NODE, EDGE }
enum DraggingMode { DRAGGING, LINKING }

function canRunAutomaton(automaton: any): Boolean {
    return automaton.states.length > 0 && automaton.initialState;
}

function resetAutomaton(automaton: any, word: string): DebuggingMode {
    return {
        currentStates: noam.fsm.computeEpsilonClosure(automaton, [automaton.initialState]),
        testWord: word,
        nextSymbolIndex: 0,
        iteratingUntilEnd: false,
    };
}

function previousSymbol(automaton: any, db: DebuggingMode): DebuggingMode {
    if (db.nextSymbolIndex <= 0) {
        return db;
    }

    return {
        currentStates: noam.fsm.readString(automaton, db.testWord.substring(0, db.nextSymbolIndex - 1).split('')),
        testWord: db.testWord,
        nextSymbolIndex: db.nextSymbolIndex - 1,
        iteratingUntilEnd: false,
    };
}

function nextSymbol(automaton: any, db: DebuggingMode): DebuggingMode {
    if (db.nextSymbolIndex >= db.testWord.length) {
        return db;
    }

    return {
        currentStates: noam.fsm.makeTransition(automaton, db.currentStates, db.testWord[db.nextSymbolIndex]),
        testWord: db.testWord,
        nextSymbolIndex: db.nextSymbolIndex + 1,
        iteratingUntilEnd: db.iteratingUntilEnd,
    };
}

function isWordInLanguage(automaton: any, word: string): Boolean {
    try {
        return noam.fsm.isStringInLanguage(automaton, word);
    } catch {
        return false;
    }
}

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {

    const [selectedObject, setSelectedObject] = useState<{ type: ObjectType, key: string } | null>();
    const [draggingMode, setDraggingMode] = useState<DraggingMode | null>();
    const [draggingOffset, setDraggingOffset] = useState<Point>();
    const [mouseLocation, setMouseLocation] = useState<{ position: Point, state: string | null }>({ position: { x: 0, y: 0 }, state: null });
    const [debuggingMode, setDebuggingMode] = useState<DebuggingMode | null>();
    const [testWord, setTestWord] = useState('');

    const doubleClickHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;
        automaton = { ...automaton };

        const state = getStateFromElement(element);
        if (state) {
            setAcceptingState(automaton, state, !noam.fsm.isAcceptingState(automaton, state));
            setSelectedObject({ type: ObjectType.NODE, key: state });
        } else {
            const transition = getTransitionFromElement(element);
            if (transition) {
                const symbol = prompt('Modify the transition symbol', transition.symbol);
                if (symbol !== null) {
                    automaton = updateTransitions(automaton, transition, symbol || '');
                }
                setSelectedObject({ type: ObjectType.EDGE, key: `${transition.from}-${transition.to}` });
            } else {
                const nextState = getNextState(automaton);
                addState(automaton, nextState, getMousePosition(e, { x: -22, y: -22 }));
                setSelectedObject({ type: ObjectType.NODE, key: nextState });
            }
        }

        onUpdate(automaton);
    }

    const mouseDownHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;
        const currentPosition = getMousePosition(e);

        const state = getStateFromElement(element);
        if (state) {
            setSelectedObject({ type: ObjectType.NODE, key: state });

            const draggingMode = e.shiftKey ? DraggingMode.LINKING : DraggingMode.DRAGGING;
            setDraggingMode(draggingMode);

            switch (draggingMode) {
                case DraggingMode.DRAGGING:
                    const statePosition = automaton.statePositions.get(state);
                    setDraggingOffset({
                        x: statePosition.x - currentPosition.x,
                        y: statePosition.y - currentPosition.y,
                    });
                    break;
                case DraggingMode.LINKING:
                    setMouseLocation({ position: currentPosition, state: state });
                    break;
            }
        } else {
            const transition = getTransitionFromElement(element);
            if (transition) {
                setSelectedObject({ type: ObjectType.EDGE, key: `${transition.from}-${transition.to}` });
            } else {
                setSelectedObject(null);
            }
        }
    }

    const mouseMoveHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        switch (draggingMode) {
            case DraggingMode.DRAGGING:
                automaton = { ...automaton };
                if (selectedObject && selectedObject.type === ObjectType.NODE) {
                    automaton.statePositions.set(selectedObject.key, getMousePosition(e, draggingOffset));
                }
                onUpdate(automaton);
                break;

            case DraggingMode.LINKING:
                setMouseLocation({
                    position: getMousePosition(e),
                    state: getStateFromElement(element),
                });
                break;
        }
    }

    const mouseUpHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        if (draggingMode === DraggingMode.LINKING) {
            const toState = getStateFromElement(element);

            if (toState && selectedObject && selectedObject.type === ObjectType.NODE) {
                const symbol = prompt("What is the transition symbol?");
                automaton = { ...automaton };
                console.log(angleOfLine(getStatePosition(automaton, selectedObject.key), getMousePosition(e)));
                automaton = updateTransitions(
                    automaton,
                    {
                        from: selectedObject.key,
                        to: toState,
                        symbol: '',
                    },
                    symbol || '',
                    angleOfLine(getStatePosition(automaton, selectedObject.key), getMousePosition(e))
                );

                onUpdate(automaton);
            }
        }

        setDraggingMode(null);
    }

    const mouseLeaveHandler = (e: React.MouseEvent) => {
        setDraggingMode(null);
    }

    var linkingEdge = null;
    if (selectedObject && selectedObject.type === ObjectType.NODE && draggingMode === DraggingMode.LINKING) {
        linkingEdge = <Edge
            automaton={automaton}
            fromState={selectedObject.key}
            toState={mouseLocation.state}
            mousePosition={mouseLocation.position}
            dragging={false}
            selected={false}
        />;
    }

    const keyUpHandler = (shortcut: string, e: KeyboardEvent, handle: HotkeysEvent) => {
        if (!selectedObject) {
            return;
        }

        automaton = { ...automaton };
        switch (shortcut) {
            case 'delete': // Remove current element
                setSelectedObject(null);
                switch (selectedObject.type) {
                    case ObjectType.NODE:
                        removeState(automaton, selectedObject.key);
                        break;
                    case ObjectType.EDGE:
                        removeTransition(automaton, selectedObject.key);
                        break;
                }
                break;

            case 'shift+a': // Set state accepting
                if (selectedObject.type === ObjectType.NODE) {
                    setAcceptingState(automaton, selectedObject.key, !noam.fsm.isAcceptingState(automaton, selectedObject.key));
                }
                break;

            case 'shift+i': // Set state as initial
                if (selectedObject.type === ObjectType.NODE) {
                    automaton.initialState = selectedObject.key;
                }
        }

        onUpdate(automaton);
    }

    const startDebuggingHandler = (e: React.MouseEvent) => {
        resetDebuggingHandler(e);
    }

    const stopDebuggingHandler = (e: React.MouseEvent) => {
        setDebuggingMode(null);
    }

    const resetDebuggingHandler = (e: React.MouseEvent) => {
        setDebuggingMode(resetAutomaton(automaton, testWord));
    }

    const stepBackwardHandler = (e: React.MouseEvent) => {
        setDebuggingMode(previousSymbol(automaton, debuggingMode!));
    }

    const stepForwardHandler = (e: React.MouseEvent) => {
        setDebuggingMode(nextSymbol(automaton, debuggingMode!));
    }

    const fastForwardHandler = (e: React.MouseEvent) => {
        setDebuggingMode({
            currentStates: debuggingMode!.currentStates,
            testWord: debuggingMode!.testWord,
            nextSymbolIndex: debuggingMode!.nextSymbolIndex,
            iteratingUntilEnd: true,
        });
    }

    useEffect(() => {
        let intervalId: number | undefined;

        if (debuggingMode && debuggingMode.iteratingUntilEnd) {
            intervalId = window.setInterval(() => setDebuggingMode(nextSymbol(automaton, debuggingMode)), 750);
        } else if (intervalId) {
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId);
    }, [debuggingMode, automaton]);

    const handleOptionsMenuClick = (click: ClickParam) => {
        if (click.key.startsWith('example')) {
            const index = Number(click.key.split('-')[1]);
            setTestWord(Examples[index].testWord);
            onUpdate(clone(Examples[index].automaton));
        }
    }

    /** TODO:
     * check if automaton is equivalent to regular expression
     * add quizes (also to regular language)
     */
    return (
        <div className="automaton-designer">
            <div className="toolbar">
                <Dropdown
                    placement="bottomLeft"
                    trigger={['click']}
                    disabled={Boolean(debuggingMode)}
                    overlay={
                        <Menu onClick={handleOptionsMenuClick}>
                            <SubMenu title="Examples">
                                {
                                    Examples.map((v, i) => <Menu.Item key={`example-${i}`}>{v.title}</Menu.Item>)
                                }
                            </SubMenu>
                        </Menu>
                    }>
                    <Button icon="menu" />
                </Dropdown>

                {debuggingMode
                    ? <span className="ant-input-affix-wrapper debugging-symbols">{
                        debuggingMode.testWord.split('').map((symbol, index) => {
                            const symbolClass = classNames({
                                consumed: index < debuggingMode.nextSymbolIndex,
                                current: index === debuggingMode.nextSymbolIndex,
                            });

                            return <span key={index} className={symbolClass}>{symbol}</span>;
                        })
                    }
                    </span>
                    : <Input
                        placeholder="Write your test word"
                        disabled={debuggingMode != null}
                        value={testWord}
                        suffix={
                            <Icon
                                type={testWord && isWordInLanguage(automaton, testWord) ? 'check' : 'close'}
                                style={{ display: (!testWord ? 'none' : 'inherit') }} />
                        }
                        onChange={(e) => setTestWord(e.target.value)}
                    />
                }

                <Tooltip title="Start debugging">
                    {debuggingMode
                        ? <Button icon="stop" onClick={stopDebuggingHandler} />
                        : <Button icon="bug" disabled={!canRunAutomaton(automaton)} onClick={startDebuggingHandler} />}
                </Tooltip>

                <Tooltip title="Reset the automaton and go back to the beginning of the input sequence">
                    <Button icon="fast-backward" disabled={!debuggingMode} onClick={resetDebuggingHandler} />
                </Tooltip>

                <Tooltip title="Go back one symbol">
                    <Button icon="step-backward" disabled={!debuggingMode} onClick={stepBackwardHandler} />
                </Tooltip>

                <Tooltip title="Consume the next input symbol in the sequence">
                    <Button icon="step-forward" disabled={!debuggingMode} onClick={stepForwardHandler} />
                </Tooltip>

                <Tooltip title="Consume all remaining input symbols">
                    <Button icon="fast-forward" disabled={!debuggingMode} onClick={fastForwardHandler} />
                </Tooltip>
            </div>

            <div className="container">
                <Hotkeys
                    keyName="delete,shift+a,shift+i"
                    onKeyUp={keyUpHandler}
                >
                    <svg
                        onDoubleClick={doubleClickHandler}
                        onMouseDown={mouseDownHandler}
                        onMouseUp={mouseUpHandler}
                        onMouseLeave={mouseLeaveHandler}
                        onMouseMove={mouseMoveHandler}
                    >
                        {(automaton.states as Array<string>).map(
                            s => <Node key={s}
                                automaton={automaton}
                                state={s}
                                selected={Boolean(selectedObject && selectedObject.type === ObjectType.NODE && selectedObject.key === s)}
                                dragging={Boolean(selectedObject && selectedObject.type === ObjectType.NODE && selectedObject.key === s && draggingMode === DraggingMode.DRAGGING)}
                                current={Boolean(debuggingMode && debuggingMode.currentStates.includes(s))}
                            />
                        )}
                        {groupByTransitions(automaton.transitions).map(
                            t => {
                                const edgeKey = `${t.fromState}-${t.toState}`;
                                return <Edge key={edgeKey} automaton={automaton}
                                    fromState={t.fromState} toState={t.toState} symbol={t.symbols.sort().join(',')}
                                    dragging={Boolean(selectedObject && selectedObject.type === ObjectType.EDGE && selectedObject.key === edgeKey && draggingMode === DraggingMode.DRAGGING)}
                                    selected={Boolean(selectedObject && selectedObject.type === ObjectType.EDGE && selectedObject.key === edgeKey)}
                                />;
                            }
                        )}
                        {linkingEdge}
                    </svg>
                </Hotkeys>
                <Help />
            </div>
        </div>
    );
}