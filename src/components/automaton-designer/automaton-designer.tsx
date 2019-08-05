import React, { useState } from 'react';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';

import noam from 'noam';

import { Edge } from './edge/edge';
import { Node } from './node/node';
import {
    DraggingMode,
    getStateFromElement,
    getMousePosition,
    getStatePosition,
    getTransitionFromElement,
    groupByTransitions,
    updateTransitions,
    addState,
    removeState,
    setAcceptingState,
    getNextState
} from './helpers';
import { Point, angleOfLine } from '../../utils/math';

import './automaton-designer.css';

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {

    const [selected, setSelected] = useState();
    const [draggingMode, setDraggingMode] = useState(DraggingMode.NONE);
    const [draggingOffset, setDraggingOffset] = useState<Point>();
    const [mouseLocation, setMouseLocation] = useState<{ position: Point, state: string | null }>({ position: { x: 0, y: 0 }, state: null });

    const doubleClickHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;
        automaton = { ...automaton };

        var state = getStateFromElement(element);
        if (state) {
            setAcceptingState(automaton, state, !noam.fsm.isAcceptingState(automaton, state));
        } else {
            const transition = getTransitionFromElement(element);
            if (transition) {
                const symbol = prompt('Modify the transition symbol', transition.symbol);
                automaton = updateTransitions(automaton, transition, symbol || '');
            } else {
                addState(automaton, getNextState(automaton), getMousePosition(e, { x: -22, y: -22 }));
            }
        }

        setSelected(state);
        onUpdate(automaton);
    }

    const mouseDownHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        const selected = getStateFromElement(element);
        setSelected(selected);

        if (!selected) {
            return;
        }

        const currentPosition = getMousePosition(e);
        const draggingMode = e.shiftKey ? DraggingMode.LINKING : DraggingMode.DRAGGING;
        setDraggingMode(draggingMode);

        switch (draggingMode) {
            case DraggingMode.DRAGGING:
                setDraggingOffset({
                    x: automaton.statePositions[selected].x - currentPosition.x,
                    y: automaton.statePositions[selected].y - currentPosition.y,
                });
                break;
            case DraggingMode.LINKING:
                setMouseLocation({ position: currentPosition, state: selected });
                break;
        }

    }

    const mouseMoveHandler = (e: React.MouseEvent) => {
        const element = e.target as Element;

        switch (draggingMode) {
            case DraggingMode.DRAGGING:
                automaton = { ...automaton };
                automaton.statePositions[selected] = getMousePosition(e, draggingOffset);
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

            if (toState) {
                const symbol = prompt("What is the transition symbol?");
                automaton = { ...automaton };
                automaton = updateTransitions(
                    automaton,
                    {
                        from: selected,
                        to: toState, symbol: ''
                    },
                    symbol || '',
                    angleOfLine(getStatePosition(automaton, selected), getMousePosition(e))
                );

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
        linkingEdge = <Edge
            automaton={automaton}
            fromState={selected}
            toState={mouseLocation.state}
            mousePosition={mouseLocation.position}
        />;
    }

    const keyUpHandler = (shortcut: string, e: KeyboardEvent, handle: HotkeysEvent) => {
        if (!selected) {
            return;
        }

        automaton = { ...automaton };
        switch (shortcut) {
            case 'delete': // Remove current element
                setSelected(null);
                console.log(selected);
                removeState(automaton, selected);
                break;

            case 'shift+a': // Set state accepting
                setAcceptingState(automaton, selected, !noam.fsm.isAcceptingState(automaton, selected));
                break;

            case 'shift+i': // Set state as initial
                automaton.initialState = selected;
        }
        console.log(automaton);
        onUpdate(automaton);
    }

    /** TODO:
     * del (key) - to delete elements (nodes and/or edges)
     * ability to select edges
     * toolbar for testing - Input (for string), Start, Reset, Step backward, Read next, Read all
     * curved links - to organise them better in the screen
     */
    return (
        <div className="automaton-designer-container">
            <Hotkeys
                keyName="delete,shift+a,shift+i"
                onKeyUp={keyUpHandler}
            >
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
                        t => <Edge key={`${t.fromState}-${t.toState}`} automaton={automaton}
                            fromState={t.fromState} toState={t.toState} symbol={t.symbols.sort().join(',')} />
                    )}
                    {linkingEdge}
                </svg>
            </Hotkeys>
        </div>
    );
}