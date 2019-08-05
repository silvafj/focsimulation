import React, { useState } from 'react';
import Hotkeys from 'react-hot-keys';
import { HotkeysEvent } from 'hotkeys-js';

import noam from 'noam';

import { Edge } from './edge/edge';
import { Node } from './node/node';
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
import { Point, angleOfLine } from '../../utils/math';

import './automaton-designer.css';

enum ObjectType { NODE, EDGE }
enum DraggingMode { DRAGGING, LINKING }

export const AutomatonDesigner: React.FC<{ automaton: any, onUpdate: (automaton: any) => void }> = ({ automaton, onUpdate }) => {

    const [selectedObject, setSelectedObject] = useState<{ type: ObjectType, key: string } | null>();
    const [draggingMode, setDraggingMode] = useState<DraggingMode | null>();
    const [draggingOffset, setDraggingOffset] = useState<Point>();
    const [mouseLocation, setMouseLocation] = useState<{ position: Point, state: string | null }>({ position: { x: 0, y: 0 }, state: null });

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
                    setDraggingOffset({
                        x: automaton.statePositions[state].x - currentPosition.x,
                        y: automaton.statePositions[state].y - currentPosition.y,
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
                    automaton.statePositions[selectedObject.key] = getMousePosition(e, draggingOffset);
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
                automaton = updateTransitions(
                    automaton,
                    {
                        from: selectedObject.key,
                        to: toState, symbol: ''
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

    /** TODO:
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
                        s => <Node key={s}
                            automaton={automaton}
                            state={s}
                            selected={Boolean(selectedObject && selectedObject.type === ObjectType.NODE && selectedObject.key === s)}
                            dragging={Boolean(selectedObject && selectedObject.type === ObjectType.NODE && selectedObject.key === s && draggingMode === DraggingMode.DRAGGING)}
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
        </div>
    );
}