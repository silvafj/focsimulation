import React from 'react';
import noam from 'noam';

import { Point } from '../../../utils/types';

import './edge.css';

function getStatePosition(automaton: any, state: string, center: boolean): Point {
    const position = automaton.statePositions[state];
    return {
        x: position.x + (center ? 22 : 0),
        y: position.y + (center ? 22 : 0),
    }
}

function getStateRadius(automaton: any, state: string): number {
    return noam.fsm.isAcceptingState(automaton, state) ? 22 : 18;
}

function calculateLineMidpoint(from: Point, to: Point): Point {
    return {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
    }
}

function closestPointOnCircle(circle: Point, radius: number, point: Point): Point {
    var dx = point.x - circle.x;
    var dy = point.y - circle.y;
    var scale = Math.sqrt(dx * dx + dy * dy);
    return {
        x: circle.x + dx * radius / scale,
        y: circle.y + dy * radius / scale,
    };
};

export const LinkingEdge: React.FC<{
    automaton: any,
    fromState: string,
    mousePosition: Point
}> = ({ automaton, fromState, mousePosition }) => {
    const from = closestPointOnCircle(
        getStatePosition(automaton, fromState, true),
        getStateRadius(automaton, fromState),
        mousePosition
    );

    return (
        <Edge from={from} to={mousePosition} />
    );
}

export const StateEdge: React.FC<{
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
        <Edge from={from} to={to} transition={{from: fromState, to: toState, symbol: symbol}} />
    );
}

const Edge: React.FC<{
    from: Point,
    to: Point,
    transition?: { from: string, to: string, symbol: string }
}> = ({ from, to, transition }) => {

    const midpoint = calculateLineMidpoint(from, to);

    var dataProps = {};
    const classes: Array<string> = ['edge'];
    if (!transition) {
        classes.push('linking');
    } else {
        dataProps = {
            'data-from': transition.from,
            'data-to': transition.to,
            'data-symbol': transition.symbol
        };
    }

    return (
        <g className={classes.join(' ')} {...dataProps}>
            <path className="line" d={`M${from.x},${from.y}L${to.x},${to.y}`} />
            <EdgeArrow from={from} to={to} />
            <text x={midpoint.x + 5} y={midpoint.y - 5}>{transition ? transition.symbol : ''}</text>
        </g>
    );
}

const EdgeArrow: React.FC<{
    from: Point,
    to: Point,
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