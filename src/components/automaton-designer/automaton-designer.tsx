import React, { useState } from 'react';
import noam from 'noam';

import { LinkingEdge, StateEdge } from './edge/edge';
import { Node } from './node/node';
import {
    DraggingMode,
    getStateFromElement,
    getMousePosition,
    getTransitionFromElement,
    groupByTransitions,
    updateTransitions
} from './helpers';

import './automaton-designer.css';

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