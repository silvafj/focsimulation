import {
  angleOfLine,
  closestPointOnCircle,
  fixed,
  midpoint,
} from '../math';

it('number with two digits precision', () => {
  expect(fixed(0.1111)).toEqual('0.11');
  expect(fixed(0.1000)).toEqual('0.1');
  expect(fixed(0.0000)).toEqual('0');
});

it('midpoint between two points', () => {
  const zero = { x: 0, y: 0 };

  expect(midpoint(zero, zero)).toEqual(zero);
  expect(midpoint(zero, { x: 2, y: 2 })).toEqual({ x: 1, y: 1 });
});

it('angle of the line', () => {
  expect(angleOfLine({ x: 0, y: 0 }, { x: 0, y: 0 }) * 180 / Math.PI).toEqual(0);
  expect(angleOfLine({ x: 0, y: 0 }, { x: 1, y: 0 }) * 180 / Math.PI).toEqual(0);
  expect(angleOfLine({ x: 0, y: 0 }, { x: -1, y: 0 }) * 180 / Math.PI).toEqual(180);
  expect(angleOfLine({ x: 0, y: 0 }, { x: 0, y: 1 }) * 180 / Math.PI).toEqual(90);
  expect(angleOfLine({ x: 0, y: 0 }, { x: 0, y: -1 }) * 180 / Math.PI).toEqual(-90);
  expect(angleOfLine({ x: 0, y: 0 }, { x: 1, y: 1 }) * 180 / Math.PI).toEqual(45);
});

it('closest point on circle', () => {
  expect(closestPointOnCircle({ cx: 0, cy: 0, r: 1 }, { x: 0, y: 10 })).toEqual({ x: 0, y: 1 });
  expect(closestPointOnCircle({ cx: 0, cy: 0, r: 1 }, { x: 10, y: 0 })).toEqual({ x: 1, y: 0 });
});
