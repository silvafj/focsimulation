import noam from 'noam';

import { Point } from '../../utils/types';

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

export function updateTransitions(
    automaton: any,
    transition: { from: string, to: string, symbol: string },
    newSymbol: string
): any {
    const newArr = newSymbol.split(',').filter(Boolean);
    const oldArr = transition.symbol.split(',').filter(Boolean);

    // Add transitions
    for (const symbol of newArr) {
        if (!automaton.alphabet.includes(symbol)) {
            noam.fsm.addSymbol(automaton, symbol);
        }

        noam.fsm.addTransition(automaton, transition.from, [transition.to], symbol);
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

export enum DraggingMode {
    NONE,
    DRAGGING,
    LINKING,
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