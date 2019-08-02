import React from 'react';
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

function getEndPointsAndCircle(circle: Point, radius: number, anchorAngle: number) {
    var circleX = circle.x + 1.5 * radius * Math.cos(anchorAngle);
    var circleY = circle.y + 1.5 * radius * Math.sin(anchorAngle);
    var circleRadius = 0.75 * radius;
    var startAngle = anchorAngle - Math.PI * 0.8;
    var endAngle = anchorAngle + Math.PI * 0.8;
    var startX = circleX + circleRadius * Math.cos(startAngle);
    var startY = circleY + circleRadius * Math.sin(startAngle);
    var endX = circleX + circleRadius * Math.cos(endAngle);
    var endY = circleY + circleRadius * Math.sin(endAngle);
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
}> = ({ automaton, fromState, toState, symbol, mousePosition }) => {
    const commands: Array<string> = [];

    var from = getStatePosition(automaton, fromState);
    const fromRadius = getStateRadius(automaton, fromState);
    var to = toState ? getStatePosition(automaton, toState) : mousePosition!;
    const mpoint = mousePosition || midpoint(from, to);

    var arrow = null;
    var label = null;

    if (fromState !== toState) {
        from = closestPointOnCircle({ cx: from.x, cy: from.y, r: fromRadius }, mpoint);
        to = toState ? closestPointOnCircle({ cx: to.x, cy: to.y, r: getStateRadius(automaton, toState) }, from) : mpoint;

        // The "lineto" commands
        // https://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands
        commands.push(`M${fixed(from.x)},${fixed(from.y)}`); // starting point
        commands.push(`L${fixed(to.x)},${fixed(to.y)}`); // end point

        arrow = <EdgeArrow point={to} angle={Math.atan2(to.y - from.y, to.x - from.x)} />;

        var textAngle = Math.atan2(to.x - from.x, from.y - to.y);
        label = <EdgeLabel point={mpoint} text={symbol || ''} angle={textAngle} />;
    } else {
        const anchorAngle = mousePosition ? angleOfLine(from, mousePosition) : automaton.transitionAngles[`${fromState}-${toState}`];
        const stuff = getEndPointsAndCircle(from, fromRadius, anchorAngle);

        if (stuff.endAngle < stuff.startAngle) {
            stuff.endAngle += Math.PI * 2;
        }

        const startX = stuff.circleX + stuff.circleRadius * Math.cos(stuff.startAngle);
        const startY = stuff.circleY + stuff.circleRadius * Math.sin(stuff.startAngle);
        const endX = stuff.circleX + stuff.circleRadius * Math.cos(stuff.endAngle);
        const endY = stuff.circleY + stuff.circleRadius * Math.sin(stuff.endAngle);
        const useGreaterThan180 = (Math.abs(stuff.endAngle - stuff.startAngle) > Math.PI) ? '1' : '0';

        // The elliptical arc curve commands
        // https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
        commands.push(`M${fixed(startX)},${fixed(startY)}`); // starting point
        commands.push(`A${fixed(stuff.circleRadius)},${fixed(stuff.circleRadius)}`); // radii
        commands.push('0'); // perfect circle
        commands.push(useGreaterThan180); // large-arc-flag
        commands.push('1'); // sweep-flag, arc drawn in a positive angle
        commands.push(`${fixed(endX)},${fixed(endY)}`); // end point

        arrow = <EdgeArrow point={{ x: stuff.endX, y: stuff.endY }} angle={stuff.endAngle + Math.PI * 0.4} />;
        label = <EdgeLabel point={{
            x: stuff.circleX + stuff.circleRadius * Math.cos(anchorAngle),
            y: stuff.circleY + stuff.circleRadius * Math.sin(anchorAngle),
        }} text={symbol || ''} angle={anchorAngle} />;
    }

    var dataProps = {};
    const classes: Array<string> = ['edge'];
    if (mousePosition) {
        classes.push('linking');
    } else {
        dataProps = {
            'data-from': fromState,
            'data-to': toState,
            'data-symbol': symbol,
        };
    }

    return (
        <g className={classes.join(' ')} {...dataProps}>
            <path className="line" d={commands.join(' ')} />
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