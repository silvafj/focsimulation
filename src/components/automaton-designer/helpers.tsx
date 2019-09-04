import noam from 'noam';

import { Attributes as NodeAttrs } from '../automaton-designer/node/node';
import { Point, angleOfLine } from '../../utils/math';

function isSVGGElement(element: Element): boolean {
  // Can't use "element instanceof SVGGElement" because SVGGElement is not defined
  // in JSDOM leading to Jest test to fail.
  return element instanceof SVGElement && element.tagName === 'g';
}

/**
 * Returns the point within the SVG that corresponds to the mouse event.
 * 
 * @param e 
 * @param offset 
 */
export function getMousePosition(e: React.MouseEvent, offset: Point = { x: 0, y: 0 }): Point {
  const svg = e.currentTarget as SVGSVGElement;
  const CTM = svg.getScreenCTM() as DOMMatrix;

  return {
    x: (e.clientX - CTM.e + offset.x) / CTM.a,
    y: (e.clientY - CTM.f + offset.y) / CTM.d,
  };
}

/**
 * Return the state corresponding to the specified element.
 * @param element 
 */
export function getStateFromElement(element: Element): string | null {
  if (element instanceof SVGElement && isSVGGElement(element) && element.classList.contains('node')) {
    return (element as SVGElement).dataset.state || null;
  } if (element.parentElement instanceof SVGElement && isSVGGElement(element.parentElement)) {
    return getStateFromElement(element.parentElement);
  }

  return null;
}

/**
 * Return the transition corresponding to the specified element.
 * 
 * @param element 
 */
export function getTransitionFromElement(element: Element): { from: string; to: string; symbol: string } | null {
  if (element instanceof SVGElement && isSVGGElement(element) && element.classList.contains('edge')) {
    return {
      from: element.dataset.from || '',
      to: element.dataset.to || '',
      symbol: element.dataset.symbol || '',
    };
  } if (element.parentElement instanceof SVGElement && isSVGGElement(element.parentElement)) {
    return getTransitionFromElement(element.parentElement);
  }
  return null;
}

/**
 * Return the coordinates relative to the center Point that represents the state.
 *
 * @param automaton
 * @param state
 */
export function getStatePosition(automaton: any, state: string): Point {
  const position = automaton.statePositions.get(state);
  return {
    x: position.x + NodeAttrs.ACCEPTED_RADIUS,
    y: position.y + NodeAttrs.ACCEPTED_RADIUS,
  };
}

/**
 * Return the next available state.
 * 
 * @param automaton 
 */
export function getNextState(automaton: any): string {
  const nextState: number = automaton.states.reduce(
    (acc: number, state: string) => Math.max(acc, parseInt(state.substr(1))), -1,
  );
  return `s${nextState + 1}`;
}

/**
 * Set the automaton state as accepting or not accepting.
 *
 * @param automaton
 * @param state
 * @param accepting
 */
export function setAcceptingState(automaton: any, state: string, accepting: boolean): void {
  if (accepting) {
    if (!noam.fsm.isAcceptingState(automaton, state)) {
      noam.fsm.addAcceptingState(automaton, state);
    }
  } else {
    automaton.acceptingStates = automaton.acceptingStates.filter((e: string) => e !== state);
  }
}

/**
 * Add a state to the automaton.
 *
 * @param automaton
 * @param state
 * @param position
 */
export function addState(automaton: any, state: string, position: Point): void {
  noam.fsm.addState(automaton, state);
  if (!automaton.statePositions) {
    automaton.statePositions = new Map<string, Point>();
  }

  automaton.statePositions.set(state, position);

  if (automaton.states.length === 1) {
    noam.fsm.setInitialState(automaton, state);
  }
}

/**
 * Remove a state from the automaton and respective transitions.
 *
 * @param automaton
 * @param state
 */
export function removeState(automaton: any, state: string): void {
  if (automaton.initialState === state) {
    automaton.initialState = '';
  }
  automaton.states = automaton.states.filter((s: string) => s !== state);
  automaton.statePositions.delete(state);
  automaton.acceptingStates = automaton.acceptingStates.filter((s: string) => s !== state);
  automaton.transitions.map((t: NoamAutomatonTransition) => t.toStates.filter((s: string) => s !== state));
  automaton.transitions = automaton.transitions.filter(
    (t: NoamAutomatonTransition) => (t.fromState !== state)
      && t.toStates.length > 0
      && !(t.toStates.length === 1 && t.toStates.includes(state)),
  );
}

/**
 * Remove a transition from the automaton.
 *
 * @param automaton
 * @param key
 */
export function removeTransition(automaton: any, key: string): void {
  automaton.transitionPositions.delete(key);

  const [fromState, toState] = key.split('-');
  automaton.transitions = automaton.transitions.filter(
    (t: NoamAutomatonTransition) => !(t.fromState === fromState && t.toStates.length === 1 && t.toStates.includes(toState)),
  );
}

/**
 * Add and remove transitions based on the current transition and new symbols.
 *
 * @param automaton
 * @param transition
 * @param newSymbol
 */
export function updateTransitions(
  automaton: any,
  transition: { from: string; to: string; symbol: string },
  newSymbol: string,
): any {
  const newArr = newSymbol.split(',').filter(Boolean);
  const oldArr = transition.symbol.split(',').filter(Boolean);

  // Add transitions
  for (const symbol of newArr) {
    if (!automaton.alphabet.includes(symbol)) {
      noam.fsm.addSymbol(automaton, symbol);
    }

    noam.fsm.addTransition(automaton, transition.from, [transition.to], symbol);

    if (!automaton.transitionPositions) {
      automaton.transitionPositions = new Map<string, { a: number, b: number }>();
    }
  }

  // Remove transitions
  for (const symbol of oldArr) {
    if (newArr.includes(symbol)) {
      continue;
    }

    for (const index in (automaton.transitions as NoamAutomatonTransitions)) {
      const value = automaton.transitions[index] as NoamAutomatonTransition;
      if (value.fromState !== transition.from || !value.toStates.includes(transition.to) || value.symbol !== symbol) {
        continue;
      }

      if (value.toStates.length === 1) {
        automaton.transitions.splice(index, 1);
      } else {
        automaton.transitions[index] = value.toStates.filter((s: string) => s !== transition.to);
      }
    }
  }

  return automaton;
}

/**
 * Update the transition position values.
 * 
 * @param automaton 
 * @param from 
 * @param to 
 * @param position 
 */
export function updateTransitionPositions(
  automaton: any,
  from: string,
  to: string,
  position: Point,
): any {
  const fromPos = getStatePosition(automaton, from);

  if (from === to) {
    const angle = angleOfLine(fromPos, position);
    automaton.transitionPositions.set(`${from}-${to}`, { a: angle, b: 0 });
  } else {
    const toPos = getStatePosition(automaton, to);

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const scale = Math.sqrt(dx * dx + dy * dy);
    const parallel = (dx * (position.x - fromPos.x) + dy * (position.y - fromPos.y)) / (scale * scale);
    let perpendicular = (dx * (position.y - fromPos.y) - dy * (position.x - fromPos.x)) / scale;

    const snapToBounds = 8
    if (parallel > 0 && parallel < 1 && Math.abs(perpendicular) < snapToBounds) {
      perpendicular = 0;
    }

    automaton.transitionPositions.set(`${from}-${to}`, { a: parallel, b: perpendicular });
  }

  return automaton;
}

type NoamAutomatonTransition = { fromState: string; toStates: Array<string>; symbol: string };
type NoamAutomatonTransitions = Array<NoamAutomatonTransition>;

/**
 * Return the transitions with a different structure suitable to dynamically generate edges.
 * 
 * @param transitions 
 */
export function groupByTransitions(transitions: NoamAutomatonTransitions):
  Array<{ fromState: string; toState: string; symbols: Array<string> }> {
  const unpacked = [];
  for (const transition of transitions) {
    for (const toState of transition.toStates) {
      unpacked.push({
        fromState: transition.fromState,
        toState,
        symbol: transition.symbol,
      });
    }
  }

  return Array.from(
    unpacked.reduce((acc, t) => {
      const key = `${t.fromState}-${t.toState}`;

      const item: { fromState: string; toState: string; symbols: Array<string> } = acc.get(key) || {
        fromState: t.fromState,
        toState: t.toState,
        symbols: [],
      };

      item.symbols.push(t.symbol);

      return acc.set(key, item);
    }, new Map<string, { fromState: string; toState: string; symbols: Array<string> }>()).values(),
  );
}
