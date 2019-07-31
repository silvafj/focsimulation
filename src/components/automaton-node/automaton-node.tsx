import React from 'react';

import noam from 'noam';

import './automaton-node.css';

export const Node: React.FC<{
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