import React from 'react';
import classNames from 'classnames';
import noam from 'noam';

import {
    getStatePosition,
} from '../helpers';
import {
    Point,
    fixed,
    midpoint,
    closestPointOnCircle,
    angleOfLine,
} from '../../../utils/math';

import './edge.css';

function getStateRadius(automaton: any, state: string): number {
    return noam.fsm.isAcceptingState(automaton, state) ? 22 : 18;
}

/**
 * Returns the commands required to draw a line with SVG path element.
 *
 * @param from
 * @param to
 */
function lineto(from: Point, to: Point): Array<string> {
    // The "lineto" commands
    // https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands
    return [
        `M${fixed(from.x)},${fixed(from.y)}`, // starting point
        `L${fixed(to.x)},${fixed(to.y)}`, // end point
    ]
}

/**
 * Returns the commands required to draw an arc with SVG path element.
 *
 * @param x
 * @param y
 * @param radius
 * @param startAngle
 * @param endAngle
 * @param isReversed
 */
function arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    isReversed: Boolean = false,
): Array<string> {
    if (isReversed) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }

    if (endAngle < startAngle) {
        endAngle += Math.PI * 2;
    }

    const startX = x + radius * Math.cos(startAngle);
    const startY = y + radius * Math.sin(startAngle);
    const endX = x + radius * Math.cos(endAngle);
    const endY = y + radius * Math.sin(endAngle);
    const useGreaterThan180 = (Math.abs(endAngle - startAngle) > Math.PI) ? '1' : '0';

    // The elliptical arc curve commands
    // https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
    return [
        `M${fixed(startX)},${fixed(startY)}`, // starting point
        `A${fixed(radius)},${fixed(radius)}`, // radii
        '0', // perfect circle
        useGreaterThan180 ? '1' : '0', // large-arc-flag
        '1', // sweep-flag, arc drawn in a positive angle
        `${fixed(endX)},${fixed(endY)}`, // end point
    ];
}

function getEndPointsAndCircle(circle: Point, radius: number, anchorAngle: number) {
    const circleX = circle.x + 1.5 * radius * Math.cos(anchorAngle);
    const circleY = circle.y + 1.5 * radius * Math.sin(anchorAngle);
    const circleRadius = 0.75 * radius;
    const startAngle = anchorAngle - Math.PI * 0.8;
    const endAngle = anchorAngle + Math.PI * 0.8;
    const startX = circleX + circleRadius * Math.cos(startAngle);
    const startY = circleY + circleRadius * Math.sin(startAngle);
    const endX = circleX + circleRadius * Math.cos(endAngle);
    const endY = circleY + circleRadius * Math.sin(endAngle);

    return {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        startAngle: startAngle,
        endAngle: endAngle,
        circleX: circleX,
        circleY: circleY,
        circleRadius: circleRadius
    };
};

export const Edge: React.FC<{
    automaton: any,
    fromState: string,
    toState?: string | null,
    symbol?: string,
    mousePosition?: Point,
    selected: boolean,
    dragging: boolean,
}> = ({ automaton, fromState, toState, symbol, mousePosition, selected, dragging }) => {
    var pathD: Array<string> = [];

    var from = getStatePosition(automaton, fromState);
    const fromRadius = getStateRadius(automaton, fromState);
    var to = toState ? getStatePosition(automaton, toState) : mousePosition!;
    const mpoint = mousePosition || midpoint(from, to);

    var arrow = null;
    var label = null;

    if (fromState !== toState) {
        from = closestPointOnCircle({ cx: from.x, cy: from.y, r: fromRadius }, mpoint);
        to = toState ? closestPointOnCircle({ cx: to.x, cy: to.y, r: getStateRadius(automaton, toState) }, from) : mpoint;

        // TODO: arc edges between two nodes

        // const anchorAngle: number = toState && automaton.transitionAngles ? automaton.transitionAngles.get(`${fromState}-${toState}`) : 0;
        // if (anchorAngle) {
        //     const stuff = getEndPointsAndCircle(from, fromRadius, anchorAngle);
        //     pathD = arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle);
        // } else {
        pathD = lineto(from, to);
        // }

        arrow = <EdgeArrow point={to} angle={Math.atan2(to.y - from.y, to.x - from.x)} />;

        var textAngle = Math.atan2(to.x - from.x, from.y - to.y);
        label = <EdgeLabel point={mpoint} text={symbol || ''} angle={textAngle} />;
    } else {
        const anchorAngle = mousePosition ? angleOfLine(from, mousePosition) : automaton.transitionAngles.get(`${fromState}-${toState}`);
        const stuff = getEndPointsAndCircle(from, fromRadius, anchorAngle);

        pathD = arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, false);

        arrow = <EdgeArrow point={{ x: stuff.endX, y: stuff.endY }} angle={stuff.endAngle + Math.PI * 0.4} />;

        label = <EdgeLabel point={{
            x: stuff.circleX + stuff.circleRadius * Math.cos(anchorAngle),
            y: stuff.circleY + stuff.circleRadius * Math.sin(anchorAngle),
        }} text={symbol || ''} angle={anchorAngle} />;
    }

    const edgeClass = classNames({
        edge: true,
        dragging: dragging,
        selected: selected,
        linking: mousePosition,
    })

    var dataProps = {};
    if (!mousePosition) {
        dataProps = {
            'data-from': fromState,
            'data-to': toState,
            'data-symbol': symbol,
        };
    }

    return (
        <g className={edgeClass} {...dataProps}>
            <path className="line" d={pathD.join(' ')} />
            {arrow}
            {label}
        </g>
    );
}

const EdgeArrow: React.FC<{
    point: Point,
    angle: number
}> = ({ point, angle }) => {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const commands: Array<string> = []
    commands.push(`M${fixed(point.x)},${fixed(point.y)}`);
    commands.push(`L${fixed(point.x - 8 * dx + 5 * dy)},${fixed(point.y - 8 * dy - 5 * dx)}`);
    commands.push(`${fixed(point.x - 8 * dx - 5 * dy)},${fixed(point.y - 8 * dy + 5 * dx)}`);

    return (
        <path className="arrow" d={commands.join(' ')} />
    );
}

const EdgeLabel: React.FC<{
    point: Point,
    text: string,
    angle?: number,
}> = ({ point, text, angle }) => {
    var x = point.x;
    var y = point.y;

    if (angle !== null && angle !== undefined) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const adjustX = 5 * (cos > 0 ? 1 : -1);
        const adjustY = (10 + 5) * (sin > 0 ? 1 : -1);
        const slide = sin * Math.pow(Math.abs(sin), 40) * adjustX - cos * Math.pow(Math.abs(cos), 10) * adjustY;
        x += adjustX - sin * slide;
        y += adjustY + cos * slide;
    }

    x = Math.round(x);
    y = Math.round(y);

    return (
        <text x={fixed(x)} y={fixed(y + 6)}>{text}</text>
    );
}