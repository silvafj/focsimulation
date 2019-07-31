import React, { useState } from 'react';
import noam from 'noam';

import { LinkingEdge, StateEdge } from './edge/edge';
import { Node } from './node/node';
import { Point } from '../../utils/types';

import './automaton-designer.css';

function getMousePosition(e: React.MouseEvent, offset: Point = { x: 0, y: 0 }): Point {
    const svg = e.currentTarget as SVGSVGElement;
    const CTM = svg.getScreenCTM() as DOMMatrix;

    return {
        x: (e.clientX - CTM.e + offset.x) / CTM.a,
        y: (e.clientY - CTM.f + offset.y) / CTM.d
    };
}

function getStateFromElement(element: Element): string | null {
    if (element instanceof SVGGElement && element.classList.contains('node')) {
        return element.dataset.state || null;
    } else if (element.parentElement instanceof SVGGElement) {
        return getStateFromElement(element.parentElement);
    } else {
        return null;
    }
}

function getTransitionFromElement(element: Element): { from: string, to: string, symbol: string } | null {
    if (element instanceof SVGGElement && element.classList.contains('edge')) {
        return {
            from: element.dataset.from || '',
            to: element.dataset.to || '',
            symbol: element.dataset.symbol || '',
        }
    } else if (element.parentElement instanceof SVGGElement) {
        return getTransitionFromElement(element.parentElement);
    } else {
        return null;
    }
}

function updateTransitions(
    automaton: any,
    transition: { from: string, to: string, symbol: string },
    newSymbol: string
): any {
    const newArr = newSymbol.split(',').filter(Boolean);
    const oldArr = transition.symbol.split(',').filter(Boolean);

    // Add transitions
    for (const symbol of newArr) {
        if (!automaton.alphabet.includes(symbol)) {
            noam.fsm.addSymbol(automaton, symbol);
        }

        noam.fsm.addTransition(automaton, transition.from, [transition.to], symbol);
    }

    // Remove transitions
    for (const symbol of oldArr) {
        if (newArr.includes(symbol)) {
            continue;
        }

        for (const index in (automaton.transitions as NoamAutomatonTransitions)) {
            const value = automaton.transitions[index] as NoamAutomatonTransition;
            if (value.fromState !== transition.from || !value.toStates.includes(transition.to) || value.symbol !== symbol) {
                continue;
            }

            if (value.toStates.length === 1) {
                automaton.transitions.splice(index, 1);
            } else {
                automaton.transitions[index] = value.toStates.filter((s: string) => s !== transition.to);
            }
        }
    }

    return automaton;
}

enum DraggingMode {
    NONE,
    DRAGGING,
    LINKING,
}

type NoamAutomatonTransition = { fromState: string, toStates: Array<string>, symbol: string };
type NoamAutomatonTransitions = Array<NoamAutomatonTransition>;

function groupByTransitions(transitions: NoamAutomatonTransitions):
    Array<{ fromState: string, toState: string, symbols: Array<string> }> {

    const unpacked = []
    for (const transition of transitions) {
        for (const toState of transition.toStates) {
            unpacked.push({
                fromState: transition.fromState,
                toState: toState,
                symbol: transition.symbol
            });
        }
    }

    return Array.from(
        unpacked.reduce((acc, t) => {
            const key = t.fromState + '-' + t.toState;

            const item: { fromState: string, toState: string, symbols: Array<string> } = acc.get(key) || {
                fromState: t.fromState,
                toState: t.toState,
                symbols: []
            };

            item.symbols.push(t.symbol);

            return acc.set(key, item);
        }, new Map<string, { fromState: string, toState: string, symbols: Array<string> }>()).values());
}

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {

    const [selected, setSelected] = useState();
    const [draggingMode, setDraggingMode] = useState(DraggingMode.NONE);
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const doubleClickHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;
        automaton = { ...automaton };

        var state = getStateFromElement(element);
        if (state) {
            if (noam.fsm.isAcceptingState(automaton, state)) {
                automaton.acceptingStates = automaton.acceptingStates.filter((e: string) => e !== state);
            } else {
                noam.fsm.addAcceptingState(automaton, state);
            }
        } else {
            const transition = getTransitionFromElement(element);
            if (transition) {
                const symbol = prompt('Modify the transition symbol', transition.symbol);
                automaton = updateTransitions(automaton, transition, symbol || '');
            } else {
                state = 's' + automaton.states.length.toString();

                noam.fsm.addState(automaton, state);
                if (!automaton.statePositions) {
                    automaton.statePositions = [];
                }

                automaton.statePositions[state] = getMousePosition(e, { x: -22, y: -22 });

                if (automaton.states.length === 1) {
                    noam.fsm.setInitialState(automaton, state);
                }
            }
        }

        setSelected(state);
        onUpdate(automaton);
    }

    const mouseDownHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        const selected = getStateFromElement(element);
        setSelected(selected);

        if (selected) {
            const draggingMode = e.shiftKey ? DraggingMode.LINKING : DraggingMode.DRAGGING;
            setDraggingMode(draggingMode);

            switch (draggingMode) {
                case DraggingMode.DRAGGING:
                    // Store an offset
                    const position = getMousePosition(e);
                    setCoordinates({
                        x: automaton.statePositions[selected].x - position.x,
                        y: automaton.statePositions[selected].y - position.y
                    });
                    break;
                case DraggingMode.LINKING:
                    setCoordinates(getMousePosition(e));
                    break;
            }
        }
    }

    const mouseMoveHandler = (e: React.MouseEvent) => {
        switch (draggingMode) {
            case DraggingMode.DRAGGING:
                automaton = { ...automaton };

                automaton.statePositions[selected] = getMousePosition(e, coordinates);

                onUpdate(automaton);
                break;

            case DraggingMode.LINKING:
                setCoordinates(getMousePosition(e));
                break;
        }
    }

    const mouseUpHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        if (draggingMode === DraggingMode.LINKING) {
            const toState = getStateFromElement(element);

            if (toState) {
                const symbol = prompt("What is the transition symbol?");
                automaton = { ...automaton };
                automaton = updateTransitions(automaton, { from: selected, to: toState, symbol: '' }, symbol || '');
                onUpdate(automaton);
            }
        }

        setDraggingMode(DraggingMode.NONE);
    }

    const mouseLeaveHandler = (e: React.MouseEvent) => {
        setDraggingMode(DraggingMode.NONE);
    }

    var linkingEdge = null;
    if (draggingMode === DraggingMode.LINKING) {
        linkingEdge = <LinkingEdge automaton={automaton} fromState={selected} mousePosition={coordinates} />;
    }

    return (
        <div className="automaton-designer-container">
            <svg
                className="automaton-designer"
                onDoubleClick={doubleClickHandler}
                onMouseDown={mouseDownHandler}
                onMouseUp={mouseUpHandler}
                onMouseLeave={mouseLeaveHandler}
                onMouseMove={mouseMoveHandler}
            >
                {(automaton.states as Array<string>).map(
                    state => <Node key={state}
                        automaton={automaton}
                        state={state}
                        dragging={selected === state && draggingMode === DraggingMode.DRAGGING}
                        selected={selected === state} />
                )}
                {groupByTransitions(automaton.transitions).map(
                    t => <StateEdge key={`${t.fromState}-${t.toState}`} automaton={automaton}
                        fromState={t.fromState} toState={t.toState} symbol={t.symbols.sort().join(',')} />
                )}
                {linkingEdge}
            </svg>
        </div>
    );
}