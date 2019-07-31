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

    const classes: Array<string> = ['edge'];
    if (!toState) {
        classes.push('linking');
    }

    return (
        <g className={classes.join(' ')}>
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
            <circle cx="22" cy="22" r="18"></circle>
            {isAccepting ? <circle cx="22" cy="22" r="22"></circle> : <></>}
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
                automaton = { ...automaton };
                if (!automaton.alphabet.includes('a')) {
                    noam.fsm.addSymbol(automaton, 'a');
                }
                noam.fsm.addTransition(automaton, selected, [toState], 'a');

                onUpdate(automaton);
            }
        }

        setDraggingMode(DraggingMode.NONE);
    }

    const mouseLeaveHandler = (e: React.MouseEvent) => {
        setDraggingMode(DraggingMode.NONE);
    }

    var edge = <></>;
    if (draggingMode === DraggingMode.LINKING) {
        edge = <Edge automaton={automaton} fromState={selected} mouseX={coordinates.x} mouseY={coordinates.y} />;
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
                {transitions}
                {edge}
            </svg>
        </div>
    );
}