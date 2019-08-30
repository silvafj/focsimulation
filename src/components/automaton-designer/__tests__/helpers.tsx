import noam from 'noam';
import {
  addState,
  getMousePosition,
  getNextState,
  getStateFromElement,
  getStatePosition,
  getTransitionFromElement,
  groupByTransitions,
  removeState,
  removeTransition,
  setAcceptingState,
  updateTransitions,
} from '../helpers';

it('automaton manage states', () => {
  const automaton = noam.fsm.makeNew();
  addState(automaton, 's1', { x: 0, y: 0 });
  expect(automaton.initialState).toEqual('s1');
  expect(automaton.states).toContainEqual('s1');
  expect(getStatePosition(automaton, 's1')).toEqual({ x: 22, y: 22 });

  addState(automaton, 's2', { x: 10, y: 10 });
  expect(automaton.initialState).toEqual('s1');
  expect(automaton.states).toContainEqual('s2');
  expect(getStatePosition(automaton, 's2')).toEqual({ x: 32, y: 32 });
  expect(automaton.acceptingStates).toHaveLength(0);

  removeState(automaton, 's1');
  expect(automaton.initialState).toEqual('');
  expect(automaton.states).not.toContainEqual('s1');
  expect(automaton.statePositions.get('s1')).toEqual(undefined);

  setAcceptingState(automaton, 's2', true);
  expect(automaton.acceptingStates).toContainEqual('s2');
  setAcceptingState(automaton, 's2', false);
  expect(automaton.acceptingStates).toHaveLength(0);
});

it('automaton manage transitions', () => {
  const automaton = noam.fsm.makeNew();
  addState(automaton, 's1', { x: 0, y: 0 });
  addState(automaton, 's2', { x: 10, y: 10 });
  updateTransitions(automaton, { from: 's1', to: 's1', symbol: '' }, 'a,c,d,e', 1);
  updateTransitions(automaton, { from: 's1', to: 's1', symbol: 'a,c,d,e' }, 'a,b', 1);
  updateTransitions(automaton, { from: 's1', to: 's2', symbol: '' }, 'c');
  expect(automaton.transitions).toHaveLength(3);

  const groupedTransitions = groupByTransitions(automaton.transitions);
  expect(groupedTransitions).toEqual([
    { fromState: 's1', toState: 's1', symbols: ['a', 'b'] },
    { fromState: 's1', toState: 's2', symbols: ['c'] }
  ]);

  removeTransition(automaton, 's1-s1');
  expect(automaton.transitions).toHaveLength(1);

  removeState(automaton, 's1');
  expect(automaton.transitions).toHaveLength(0);
});

it('get state from element', () => {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  g.appendChild(circle);
  g.classList.add('node');
  g.dataset.state = 's1';

  expect(getStateFromElement(circle)).toEqual('s1');

  const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  expect(getStateFromElement(circle2)).toEqual(null);
});

it('get transition from element', () => {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  g.appendChild(line);
  g.classList.add('edge');
  g.dataset.from = 's1';
  g.dataset.to = 's2';
  g.dataset.symbol = 'a';

  expect(getTransitionFromElement(line)).toEqual({ from: 's1', to: 's2', symbol: 'a' });

  const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
  expect(getTransitionFromElement(line2)).toEqual(null);
});

it('return a new available state', () => {
  const automaton = noam.fsm.makeNew();
  expect(getNextState(automaton)).toEqual('s0');
  addState(automaton, 's10', { x: 0, y: 0 });
  expect(getNextState(automaton)).toEqual('s11');
})

it('get SVG mouse position', () => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.getScreenCTM = () => {
    return {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 500,
      f: 500,
    } as DOMMatrix
  }

  expect(getMousePosition({
    currentTarget: svg,
    clientX: 500,
    clientY: 500,
  } as unknown as React.MouseEvent)).toEqual({ x: 0, y: 0 });
})