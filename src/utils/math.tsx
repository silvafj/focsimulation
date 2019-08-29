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
  let anchorAngle = Math.atan2(end.y - start.y, end.x - start.x) + offsetAngle;
  if (anchorAngle < -Math.PI) {
    anchorAngle += 2 * Math.PI;
  }

  if (anchorAngle > Math.PI) {
    anchorAngle -= 2 * Math.PI;
  }
  return anchorAngle;
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
