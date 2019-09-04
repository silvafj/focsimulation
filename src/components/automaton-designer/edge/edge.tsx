import React from 'react';
import classNames from 'classnames';
import noam from 'noam';

import {
  getStatePosition,
} from '../helpers';
import {
  angleOfLine,
  circleFromThreePoints,
  closestPointOnCircle,
  fixed,
  midpoint,
  Point,
} from '../../../utils/math';
import { Attributes as NodeAttrs, Attributes } from '../node/node';

import './edge.css';

function getStateRadius(automaton: any, state: string): number {
  return noam.fsm.isAcceptingState(automaton, state) ? NodeAttrs.ACCEPTED_RADIUS : NodeAttrs.NODE_RADIUS;
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
  ];
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
  isReversed = false,
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
  const useGreaterThan180 = (Math.abs(endAngle - startAngle) > Math.PI);

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

export const Edge: React.FC<{
  automaton: any;
  fromState: string;
  toState?: string | null;
  symbol?: string;
  mousePosition?: Point;
  selected: boolean;
  dragging: boolean;
}> = ({
  automaton,
  fromState, toState, symbol, mousePosition, selected, dragging,
}) => {
    function generateSelfEdge(): void {
      const angle = mousePosition ? angleOfLine(from, mousePosition) : (tPositions ? tPositions.a : 0);

      const circleX = from.x + 1.5 * fromRadius * Math.cos(angle);
      const circleY = from.y + 1.5 * fromRadius * Math.sin(angle);
      const circleRadius = 0.75 * NodeAttrs.NODE_RADIUS;
      const startAngle = angle - Math.PI * 0.8;
      const endAngle = angle + Math.PI * 0.8;
      const endX = circleX + circleRadius * Math.cos(endAngle);
      const endY = circleY + circleRadius * Math.sin(endAngle);

      pathD = arc(circleX, circleY, circleRadius, startAngle, endAngle, false);

      arrow = <EdgeArrow
        point={{ x: endX, y: endY }}
        angle={endAngle + Math.PI * 0.4}
      />;

      label = (
        <EdgeLabel
          point={{
            x: circleX + circleRadius * Math.cos(angle),
            y: circleY + circleRadius * Math.sin(angle),
          }}
          text={symbol || ''}
          angle={angle}
        />
      );
    }

    function generateStraigthEdge(): void {
      from = closestPointOnCircle({ cx: from.x, cy: from.y, r: fromRadius }, mpoint);
      to = toState ? closestPointOnCircle({ cx: to.x, cy: to.y, r: getStateRadius(automaton, toState) }, from) : mpoint;

      pathD = lineto(from, to);
      arrow = <EdgeArrow point={to} angle={Math.atan2(to.y - from.y, to.x - from.x)} />;

      const textAngle = Math.atan2(to.x - from.x, from.y - to.y);
      label = <EdgeLabel point={mpoint} text={symbol || ''} angle={textAngle} />;
    }

    function generateCurvedEdge(): void {
      // get anchor point
      const dx = from.x - to.x;
      const dy = from.y - to.y;
      const scale = Math.sqrt(dx * dx + dy * dy);
      const anchor = {
        x: to.x + dx * tPositions.a - dy * tPositions.b / scale,
        y: to.y + dy * tPositions.a + dx * tPositions.b / scale
      };

      const circle = circleFromThreePoints({ x: from.x, y: from.y }, { x: to.x, y: to.y }, anchor);
      const isReversed = (tPositions.b > 0);
      const reverseScale = isReversed ? 1 : -1;
      const startAngle = Math.atan2(from.y - circle.cy, from.x - circle.cx) - reverseScale * fromRadius / circle.r;
      const endAngle = Math.atan2(to.y - circle.cy, to.x - circle.cx) + reverseScale * (toState ? getStateRadius(automaton, toState) : Attributes.NODE_RADIUS) / circle.r;
      const endX = circle.cx + circle.r * Math.cos(endAngle);
      const endY = circle.cy + circle.r * Math.sin(endAngle);

      pathD = arc(circle.cx, circle.cy, circle.r, startAngle, endAngle, isReversed);
      arrow = <EdgeArrow
        point={{ x: endX, y: endY }}
        angle={endAngle - reverseScale * (Math.PI / 2)}
      />;

      const textAngle = Math.atan2(to.x - from.x, from.y - to.y);
      label = <EdgeLabel point={mpoint} text={symbol || ''} angle={textAngle} />;
    }

    let arrow = null;
    let label = null;
    let pathD: Array<string> = [];

    let from = getStatePosition(automaton, fromState);
    let to = toState ? getStatePosition(automaton, toState) : mousePosition!;
    const fromRadius = getStateRadius(automaton, fromState);
    const mpoint = mousePosition || midpoint(from, to);
    const tPositions = toState && automaton.transitionPositions ? automaton.transitionPositions.get(`${fromState}-${toState}`) : null;

    if (fromState === toState) {
      generateSelfEdge();
    } else {
      if (!tPositions || tPositions.b === 0) {
        generateStraigthEdge();
      } else {
        generateCurvedEdge();
      }
    }

    const edgeClass = classNames({
      edge: true,
      dragging,
      selected,
      linking: mousePosition,
    });

    let dataProps = {};
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
  };

const EdgeArrow: React.FC<{
  point: Point;
  angle: number;
}> = ({ point, angle }) => {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  const commands: Array<string> = [];
  commands.push(`M${fixed(point.x)},${fixed(point.y)}`);
  commands.push(`L${fixed(point.x - 8 * dx + 5 * dy)},${fixed(point.y - 8 * dy - 5 * dx)}`);
  commands.push(`${fixed(point.x - 8 * dx - 5 * dy)},${fixed(point.y - 8 * dy + 5 * dx)}`);

  return (
    <path className="arrow" d={commands.join(' ')} />
  );
};

const EdgeLabel: React.FC<{
  point: Point;
  text: string;
  angle?: number;
}> = ({ point, text, angle }) => {
  let { x } = point;
  let { y } = point;

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
};
