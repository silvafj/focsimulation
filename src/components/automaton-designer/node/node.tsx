import React from 'react';
import classNames from 'classnames';
import noam from 'noam';

import { Point, fixed } from '../../../utils/math';

import './node.css';

export const Node: React.FC<{
    automaton: any,
    state: string,
    selected: boolean,
    dragging: boolean,
    current: boolean
}> = ({ automaton, state, selected, dragging, current }) => {

    const position: Point = automaton.statePositions[state];
    const translate = `translate(${fixed(position.x)},${fixed(position.y)})`;

    const isAccepting: boolean = noam.fsm.isAcceptingState(automaton, state);
    const isInitial: boolean = (automaton.initialState === state);

    const nodeClass = classNames({
        node: true,
        dragging: dragging,
        selected: selected,
        accept: noam.fsm.isAcceptingState(automaton, state),
        current: current,
    });

    var initialStateArrow = null;
    if (isInitial) {
        const xOffset = isAccepting ? -4 : 0;
        initialStateArrow = <polyline points={`${-8 + xOffset},14 ${2 + xOffset},22 ${-8 + xOffset},30`} />;
    }

    return (
        <g className={nodeClass} transform={translate} data-state={state}>
            {initialStateArrow}
            <circle cx="22" cy="22" r="18" />
            {isAccepting ? <circle cx="22" cy="22" r="22" /> : null}
            <text x="22" y="27">{state}</text>
        </g>
    );
};