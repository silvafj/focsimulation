import React, { useState } from 'react';

import noam from 'noam';

import './automaton-designer.css';

function getMousePosition(e: React.MouseEvent, offsetX = 0, offsetY = 0) {
    const svg = e.currentTarget as SVGSVGElement;
    const CTM = svg.getScreenCTM() as DOMMatrix;

    return {
        x: (e.clientX - CTM.e + offsetX) / CTM.a,
        y: (e.clientY - CTM.f + offsetY) / CTM.d
    };
}

function getStatePosition(automaton: any, state: string, center: boolean) {
    const position = automaton.statePositions[state];
    return {
        x: position.x + (center ? 22 : 0),
        y: position.y + (center ? 22 : 0),
    }
}

function getStateRadius(automaton: any, state: string) {
    return noam.fsm.isAcceptingState(automaton, state) ? 22 : 18;
}

function calculateLineMidpoint(from: { x: number, y: number }, to: { x: number, y: number }) {
    return {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
    }
}

function closestPointOnCircle(circle: { x: number, y: number }, radius: number, point: { x: number, y: number }) {
    var dx = point.x - circle.x;
    var dy = point.y - circle.y;
    var scale = Math.sqrt(dx * dx + dy * dy);
    return {
        x: circle.x + dx * radius / scale,
        y: circle.y + dy * radius / scale,
    };
};

const LinkingEdge: React.FC<{
    automaton: any,
    fromState: string,
    mousePosition: { x: number, y: number }
}> = ({ automaton, fromState, mousePosition }) => {
    const from = closestPointOnCircle(
        getStatePosition(automaton, fromState, true),
        getStateRadius(automaton, fromState),
        mousePosition
    );

    return (
        <Edge from={from} to={mousePosition} linking={true} text="" />
    );
}

const StateEdge: React.FC<{
    automaton: any,
    fromState: string,
    toState: string,
    symbol: string
}> = ({ automaton, fromState, toState, symbol }) => {

    var from = getStatePosition(automaton, fromState, true);
    var to = getStatePosition(automaton, toState, true);

    const midpoint = calculateLineMidpoint(from, to);

    from = closestPointOnCircle(from, getStateRadius(automaton, fromState), midpoint);
    to = closestPointOnCircle(to, getStateRadius(automaton, toState), midpoint);

    return (
        <Edge from={from} to={to} linking={false} text={symbol} />
    );
}

const Edge: React.FC<{
    from: { x: number, y: number },
    to: { x: number, y: number },
    linking: boolean,
    text: string,
}> = ({ from, to, linking, text }) => {

    const midpoint = calculateLineMidpoint(from, to);

    const classes: Array<string> = ['edge'];
    if (linking) {
        classes.push('linking');
    }

    return (
        <g className={classes.join(' ')}>
            <path className="line" d={`M${from.x},${from.y}L${to.x},${to.y}`} />
            <EdgeArrow from={from} to={to} />
            <text x={midpoint.x + 5} y={midpoint.y - 5}>{text}</text>
        </g>
    );
}

const EdgeArrow: React.FC<{
    from: { x: number, y: number },
    to: { x: number, y: number },
}> = ({ from, to }) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const path: Array<string> = []
    path.push(`M${to.x},${to.y}`);
    path.push(`L${to.x - 8 * dx + 5 * dy},${to.y - 8 * dy - 5 * dx}`);
    path.push(` ${to.x - 8 * dx - 5 * dy},${to.y - 8 * dy + 5 * dx}`);

    return (
        <path className="arrow" d={path.join('')} />
    );
}

const Node: React.FC<{
    automaton: any,
    state: string,
    dragging: boolean,
    selected: boolean,
}> = ({ automaton, state, dragging, selected }) => {

    const position: { x: number, y: number } = automaton.statePositions[state];
    const translate = `translate(${position.x}, ${position.y})`;

    const isAccepting: boolean = noam.fsm.isAcceptingState(automaton, state);
    const isInitial: boolean = (automaton.initialState === state);

    const classes: Array<string> = ['node'];
    if (dragging) {
        classes.push('dragging');
    }
    if (selected) {
        classes.push('selected');
    }
    if (noam.fsm.isAcceptingState(automaton, state)) {
        classes.push('accept');
    }

    var initialStateArrow = null;
    if (isInitial) {
        const xOffset = isAccepting ? -4 : 0;
        initialStateArrow = <polyline points={`${-8 + xOffset},14 ${2 + xOffset},22 ${-8 + xOffset},30`} />;
    }

    return (
        <g className={classes.join(' ')} transform={translate} data-state={state}>
            {initialStateArrow}
            <circle cx="22" cy="22" r="18" />
            {isAccepting ? <circle cx="22" cy="22" r="22" /> : <></>}
            <text x="22" y="27">{state}</text>
        </g>
    );
};

function getStateFromElement(element: Element): any {
    if (element instanceof SVGGElement) {
        return element.dataset.state;
    } else if (element.parentElement instanceof SVGGElement) {
        return getStateFromElement(element.parentElement);
    } else {
        return null;
    }
}

enum DraggingMode {
    NONE,
    DRAGGING,
    LINKING,
}

function groupByTransitions(transitions: Array<{ fromState: string, toStates: Array<string>, symbol: string }>):
    Array<{ fromState: string, toState: string, symbols: Array<string> }> {

    const unpacked = []
    for (var transition of transitions) {
        for (var toState of transition.toStates) {
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
            state = 's' + automaton.states.length.toString();

            noam.fsm.addState(automaton, state);
            if (!automaton.statePositions) {
                automaton.statePositions = [];
            }

            automaton.statePositions[state] = getMousePosition(e, -22, -22);

            if (automaton.states.length === 1) {
                noam.fsm.setInitialState(automaton, state);
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
                    var position = getMousePosition(e);
                    position.x = automaton.statePositions[selected].x - position.x;
                    position.y = automaton.statePositions[selected].y - position.y;
                    setCoordinates(position);
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

                automaton.statePositions[selected] = getMousePosition(e, coordinates.x, coordinates.y);

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
                const symbol = prompt("What is the transition character?");
                if (symbol) {
                    automaton = { ...automaton };
                    if (!automaton.alphabet.includes(symbol)) {
                        noam.fsm.addSymbol(automaton, symbol);
                    }
                    noam.fsm.addTransition(automaton, selected, [toState], symbol);

                    onUpdate(automaton);
                }
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
        <div className="automaton-designer">
            <svg
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
                        fromState={t.fromState} toState={t.toState} symbol={t.symbols.join(',')} />
                )}
                {linkingEdge}
            </svg>
        </div>
    );
}