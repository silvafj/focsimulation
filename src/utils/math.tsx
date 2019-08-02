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
export function fixed(n: number): string {
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
    }
}

/**
 * Return the angle of the line defined by two points and the horizontal axis.
 * 
 * @param center 
 * @param point 
 * @param offsetAngle 
 */
export function angleOfLine(center: Point, point: Point, offsetAngle: number = 0): number {
    var anchorAngle = Math.atan2(point.y - center.y, point.x - center.x) + offsetAngle;
    if (anchorAngle < -Math.PI) {
        anchorAngle += 2 * Math.PI;
    }

    if (anchorAngle > Math.PI) {
        anchorAngle -= 2 * Math.PI;
    }
    return anchorAngle;
};


/**
 * Return the point within a circle that is closest to the specific point.
 * 
 * @param circle 
 * @param point 
 */
export function closestPointOnCircle(circle: Circle, point: Point): Point {
    var dx = point.x - circle.cx;
    var dy = point.y - circle.cy;
    var scale = Math.sqrt(dx * dx + dy * dy);

    return {
        x: circle.cx + dx * circle.r / scale,
        y: circle.cy + dy * circle.r / scale,
    };
};