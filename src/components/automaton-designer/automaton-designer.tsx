import React, { useState } from 'react';

import noam from 'noam';

import './automaton-designer.css';

function relativePositionToElement(target: Element, x: number, y: number) {
    const rect = target.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

function closestPointOnCircle(nX: number, nY: number, nR: number, x: number, y: number) {
    var dx = x - nX;
    var dy = y - nY;
    var scale = Math.sqrt(dx * dx + dy * dy);
    return {
        fromX: nX + dx * nR / scale,
        fromY: nY + dy * nR / scale,
    };
};


const Edge: React.FC<{
    automaton: any,
    fromState: string,
    toState?: string,
    mouseX?: number,
    mouseY?: number,
    symbol?: string
}> = ({ automaton, fromState, toState, mouseX, mouseY, symbol }) => {

    const isAccepting: boolean = noam.fsm.isAcceptingState(automaton, fromState);

    const toX: number = mouseX ? mouseX : (toState ? automaton.statePositions[toState].x : 0);
    const toY: number = mouseY ? mouseY : (toState ? automaton.statePositions[toState].y : 0);
    const radius: number = isAccepting ? 22 : 18;

    const { fromX, fromY } = closestPointOnCircle(
        automaton.statePositions[fromState].x + 22,
        automaton.statePositions[fromState].y + 22,
        radius, toX, toY);


    const arrow = (x: number, y: number, angle: number) => {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        return (
            <path className="arrow" d={`M${x},${y}L${x - 8 * dx + 5 * dy},${y - 8 * dy - 5 * dx} ${x - 8 * dx - 5 * dy},${y - 8 * dy + 5 * dx}`}></path>
        );
    }

    return (
        <g className="edge">
            <path className="line" d={`M${fromX},${fromY}L${toX},${toY}`}></path>
            {arrow(toX, toY, Math.atan2(toY - fromY, toX - fromX))}
        </g>
    );
}

const Node: React.FC<{
    automaton: any,
    state: string,
    dragging: boolean,
    selected: boolean,
    onSelect: (state: string) => void,
    onToggleState: (state: string) => void,
    onDragStart: (state: string, event: React.MouseEvent) => void
    onDragEnd: (state: string, event: React.MouseEvent) => void
}> = ({ automaton, state, dragging, selected, onSelect, onToggleState, onDragStart, onDragEnd }) => {

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

    const isAccepting: boolean = noam.fsm.isAcceptingState(automaton, state);
    const isInitial: boolean = (automaton.initialState === state);

    return (
        <g
            className={classes.join(' ')}
            transform={`translate(${automaton.statePositions[state].x}, ${automaton.statePositions[state].y})`}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation();
                onSelect(state);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onToggleState(state)
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                onDragStart(state, e)
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                onDragEnd(state, e)
            }}
        >
            {isInitial ? <polyline points="-12,14 0,22 -12,30" /> : <></>}
            <circle cx="22" cy="22" r="18"></circle>
            {isAccepting ? <circle cx="22" cy="22" r="22"></circle> : <></>}
            <text x="22" y="27">{state}</text>
        </g>
    );
};

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {

    const [selected, setSelected] = useState('');
    const [dragging, setDragging] = useState('');
    const [linking, setLinking] = useState('');
    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

    const addNewState = (e: React.MouseEvent) => {
        const state = 's' + automaton.states.length.toString();
        setSelected(state);

        automaton = { ...automaton };
        noam.fsm.addState(automaton, state);
        if (!automaton.statePositions) {
            automaton.statePositions = [];
        }

        automaton.statePositions[state] = relativePositionToElement(e.currentTarget, e.clientX - 22, e.clientY - 22);

        if (automaton.states.length === 1) {
            noam.fsm.setInitialState(automaton, state);
        }

        onUpdate(automaton);
    }

    const toggleAcceptState = (state: string) => {
        automaton = { ...automaton };
        if (noam.fsm.isAcceptingState(automaton, state)) {
            automaton.acceptingStates = automaton.acceptingStates.filter((e: string) => e !== state);
        } else {
            noam.fsm.addAcceptingState(automaton, state);
        }

        onUpdate(automaton);
    }

    const dragStart = (state: string, e: React.MouseEvent) => {
        setSelected(state);
        if (e.shiftKey) {
            setLinking(state);
            if (e.currentTarget) {
                setCoordinates(relativePositionToElement(e.currentTarget, e.clientX, e.clientY));
            }
        } else {
            setDragging(state);
        }
    }

    const drag = (e: React.MouseEvent) => {
        if (dragging) {
            automaton = { ...automaton };
            automaton.statePositions[dragging].x += e.movementX;
            automaton.statePositions[dragging].y += e.movementY;
            onUpdate(automaton);
        } else if (linking) {
            setCoordinates(relativePositionToElement(e.currentTarget, e.clientX + 5, e.clientY + 5));
        }
    }

    const dragEnd = (state: string, e: React.MouseEvent) => {
        if (linking) {
            automaton = { ...automaton };
            if (!automaton.alphabet.includes('a')) {
                noam.fsm.addSymbol(automaton, 'a');
            }
            noam.fsm.addTransition(automaton, linking, [state], 'a');

            onUpdate(automaton);
        }

        dragExit(e);
    }

    const dragExit = (e: React.MouseEvent) => {
        setLinking('');
        setDragging('');
    }

    var edge = <></>;
    if (linking) {
        edge = <Edge automaton={automaton} fromState={linking} mouseX={coordinates.x} mouseY={coordinates.y} />;
    }

    const originalTransitions = automaton.transitions as Array<{ fromState: string, toStates: Array<string>, symbol: string }>;
    var transitions = [];
    for (var transition of originalTransitions) {
        for (var toState of transition.toStates) {
            const key: string = transition.fromState + '-' + toState + '-' + transition.symbol;
            transitions.push(
                <Edge key={key} automaton={automaton} fromState={transition.fromState} toState={toState} symbol={transition.symbol} />
            );
        }
    }

    return (
        <div
            className="automaton-designer"
            onClick={(e) => setSelected('')}
            onDoubleClick={addNewState}
            onMouseMove={drag}
            onMouseLeave={dragExit}
        >
            <svg>
                {(automaton.states as Array<string>).map(
                    state => <Node key={state} automaton={automaton} state={state}
                        dragging={dragging === state}
                        selected={selected === state}
                        onSelect={state => setSelected(state)}
                        onToggleState={toggleAcceptState}
                        onDragStart={dragStart}
                        onDragEnd={dragEnd} />
                )}
                {transitions}
                {edge}
            </svg>
        </div>
    );
}