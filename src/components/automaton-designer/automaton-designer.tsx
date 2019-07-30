import React, { useState } from 'react';

import noam from 'noam';

import './automaton-designer.css';

const Link: React.FC<{}> = ({ }) => {

    return (
        <></>
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

    const addNewState = (e: React.MouseEvent) => {
        const state = 's' + automaton.states.length.toString();
        setSelected(state);

        automaton = { ...automaton };
        noam.fsm.addState(automaton, state);
        if (!automaton.statePositions) {
            automaton.statePositions = [];
        }

        var rect = e.currentTarget.getBoundingClientRect();
        automaton.statePositions[state] = {
            x: e.clientX - rect.left - 22,
            y: e.clientY - rect.top - 22
        };

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
            </svg>
        </div>
    );
}