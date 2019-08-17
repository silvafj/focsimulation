import noam from 'noam';

import { Point } from '../../utils/math';
import { string } from 'prop-types';

export function getMousePosition(e: React.MouseEvent, offset: Point = { x: 0, y: 0 }): Point {
    const svg = e.currentTarget as SVGSVGElement;
    const CTM = svg.getScreenCTM() as DOMMatrix;

    return {
        x: (e.clientX - CTM.e + offset.x) / CTM.a,
        y: (e.clientY - CTM.f + offset.y) / CTM.d
    };
}

export function getStateFromElement(element: Element): string | null {
    if (element instanceof SVGGElement && element.classList.contains('node')) {
        return element.dataset.state || null;
    } else if (element.parentElement instanceof SVGGElement) {
        return getStateFromElement(element.parentElement);
    } else {
        return null;
    }
}

export function getTransitionFromElement(element: Element): { from: string, to: string, symbol: string } | null {
    if (element instanceof SVGGElement && element.classList.contains('edge')) {
        return {
            from: element.dataset.from || '',
            to: element.dataset.to || '',
            symbol: element.dataset.symbol || '',
        }
    } else if (element.parentElement instanceof SVGGElement) {
        return getTransitionFromElement(element.parentElement);
    } else {
        return null;
    }
}

export function getStatePosition(automaton: any, state: string): Point {
    const position = automaton.statePositions.get(state);
    return {
        x: position.x + 22,
        y: position.y + 22,
    }
}

export function getNextState(automaton: any): string {
    const nextState: number = automaton.states.reduce(
        (acc: number, state: string) => Math.max(acc, parseInt(state.substr(1))), -1);
    return 's' + (nextState + 1);
}

export function setAcceptingState(automaton: any, state: string, accepting: boolean): void {
    if (accepting) {
        if (!noam.fsm.isAcceptingState(automaton, state)) {
            noam.fsm.addAcceptingState(automaton, state);
        }
    } else {
        automaton.acceptingStates = automaton.acceptingStates.filter((e: string) => e !== state);
    }
}

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

export function removeState(automaton: any, state: string): void {
    if (automaton.initialState === state) {
        automaton.initialState = '';
    }
    automaton.states = automaton.states.filter((s: string) => s !== state);
    automaton.statePositions.delete(state);
    automaton.acceptingStates = automaton.acceptingStates.filter((s: string) => s !== state);
    automaton.transitions.map((t: NoamAutomatonTransition) => t.toStates.filter((s: string) => s !== state));
    automaton.transitions = automaton.transitions.filter(
        (t: NoamAutomatonTransition) => (t.fromState !== state) &&
            t.toStates.length > 0 &&
            !(t.toStates.length === 1 && t.toStates.includes(state)));
}

export function removeTransition(automaton: any, key: string): void {
    automaton.transitionAngles.delete(key);

    const [fromState, toState] = key.split('-');
    automaton.transitions = automaton.transitions.filter(
        (t: NoamAutomatonTransition) => !(t.fromState === fromState && t.toStates.length === 1 && t.toStates.includes(toState)));

}

export function updateTransitions(
    automaton: any,
    transition: { from: string, to: string, symbol: string },
    newSymbol: string,
    transitionAngle?: number,
): any {
    const newArr = newSymbol.split(',').filter(Boolean);
    const oldArr = transition.symbol.split(',').filter(Boolean);

    // Add transitions
    for (const symbol of newArr) {
        if (!automaton.alphabet.includes(symbol)) {
            noam.fsm.addSymbol(automaton, symbol);
        }

        noam.fsm.addTransition(automaton, transition.from, [transition.to], symbol);

        if (transitionAngle) {
            if (!automaton.transitionAngles) {
                automaton.transitionAngles = new Map<string, number>();
            }
            automaton.transitionAngles.set(`${transition.from}-${transition.to}`, transitionAngle);
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

type NoamAutomatonTransition = { fromState: string, toStates: Array<string>, symbol: string };
type NoamAutomatonTransitions = Array<NoamAutomatonTransition>;

export function groupByTransitions(transitions: NoamAutomatonTransitions):
    Array<{ fromState: string, toState: string, symbols: Array<string> }> {

    const unpacked = []
    for (const transition of transitions) {
        for (const toState of transition.toStates) {
            unpacked.push({
                fromState: transition.fromState,
                toState: toState,
                symbol: transition.symbol
            });
        }
    }

    return Array.from(
        unpacked.reduce((acc, t) => {
            const key = t.fromState + '-' + t.toState;

            const item: { fromState: string, toState: string, symbols: Array<string> } = acc.get(key) || {
                fromState: t.fromState,
                toState: t.toState,
                symbols: []
            };

            item.symbols.push(t.symbol);

            return acc.set(key, item);
        }, new Map<string, { fromState: string, toState: string, symbols: Array<string> }>()).values());
}