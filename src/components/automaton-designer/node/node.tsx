import React from 'react';
import classNames from 'classnames';
import noam from 'noam';

import { Point, fixed } from '../../../utils/math';

import './node.css';

export enum Attributes {
  ACCEPTED_RADIUS = 22,
  NODE_RADIUS = 18,
}

export const Node: React.FC<{
  automaton: any;
  state: string;
  selected: boolean;
  dragging: boolean;
  current: boolean;
}> = ({
  automaton, state, selected, dragging, current,
}) => {
    const position: Point = automaton.statePositions.get(state);
    const translate = `translate(${fixed(position.x)},${fixed(position.y)})`;

    const isAccepting: boolean = noam.fsm.isAcceptingState(automaton, state);
    const isInitial: boolean = (automaton.initialState === state);

    const nodeClass = classNames({
      node: true,
      dragging,
      selected,
      accept: noam.fsm.isAcceptingState(automaton, state),
      current,
    });

    let initialStateArrow = null;
    if (isInitial) {
      const xOffset = isAccepting ? -4 : 0;
      initialStateArrow = <polyline points={`${-8 + xOffset},14 ${2 + xOffset},${Attributes.ACCEPTED_RADIUS} ${-8 + xOffset},30`} />;
    }

    return (
      <g className={nodeClass} transform={translate} data-state={state}>
        {initialStateArrow}
        {isAccepting ? <circle cx={Attributes.ACCEPTED_RADIUS} cy={Attributes.ACCEPTED_RADIUS} r={Attributes.ACCEPTED_RADIUS} /> : null}
        <circle cx={Attributes.ACCEPTED_RADIUS} cy={Attributes.ACCEPTED_RADIUS} r={Attributes.NODE_RADIUS} />
        <text x={Attributes.ACCEPTED_RADIUS} y="27">{state}</text>
      </g>
    );
  };
