export type Point = {
  readonly x: number;
  readonly y: number;
}

export type Circle = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
}

/**
 * Return a number with 2 digits precision on the fraction part.
 *
 * @param number
 */
export function fixed(number: number): string {
  return number.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Return the midpoint between two points.
 *
 * @param start
 * @param end
 */
export function midpoint(start: Point, end: Point): Point {
  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };
}

/**
 * Return the angle (in radians) of the line defined by two points and the horizontal axis.
 *
 * @param start
 * @param end
 * @param offsetAngle
 */
export function angleOfLine(start: Point, end: Point, offsetAngle = 0): number {
  let angle = Math.atan2(end.y - start.y, end.x - start.x) + offsetAngle;
  if (angle < -Math.PI) {
    angle += 2 * Math.PI;
  }

  if (angle > Math.PI) {
    angle -= 2 * Math.PI;
  }
  return angle;
}


/**
 * Return the point within a circle that is closest to the specific point.
 *
 * @param circle
 * @param point
 */
export function closestPointOnCircle(circle: Circle, point: Point): Point {
  const dx = point.x - circle.cx;
  const dy = point.y - circle.cy;
  const scale = Math.sqrt(dx * dx + dy * dy);

  return {
    x: circle.cx + dx * circle.r / scale,
    y: circle.cy + dy * circle.r / scale,
  };
}

/**
 * Return the circle where three points lie on it.
 * 
 * See https://www.geeksforgeeks.org/equation-of-circle-when-three-points-on-the-circle-are-given/
 * See https://github.com/evanw/fsm/blob/master/src/main/math.js
 * 
 * @param p1 
 * @param p2 
 * @param p3 
 */
export function circleFromThreePoints(p1: Point, p2: Point, p3: Point): Circle {

  function eqn(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) {
    return a * e * i + b * f * g + c * d * h - a * f * h - b * d * i - c * e * g;
  }

  const a = eqn(p1.x, p1.y, 1, p2.x, p2.y, 1, p3.x, p3.y, 1);
  const bx = -eqn(p1.x * p1.x + p1.y * p1.y, p1.y, 1, p2.x * p2.x + p2.y * p2.y, p2.y, 1, p3.x * p3.x + p3.y * p3.y, p3.y, 1);
  const by = eqn(p1.x * p1.x + p1.y * p1.y, p1.x, 1, p2.x * p2.x + p2.y * p2.y, p2.x, 1, p3.x * p3.x + p3.y * p3.y, p3.x, 1);
  const c = -eqn(p1.x * p1.x + p1.y * p1.y, p1.x, p1.y, p2.x * p2.x + p2.y * p2.y, p2.x, p2.y, p3.x * p3.x + p3.y * p3.y, p3.x, p3.y);

  return {
    cx: -bx / (2 * a),
    cy: -by / (2 * a),
    r: Math.sqrt(bx * bx + by * by - 4 * a * c) / (2 * Math.abs(a))
  };
}