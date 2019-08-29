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
});

it('automaton manage transitions', () => {
    const automaton = noam.fsm.makeNew();
    addState(automaton, 's1', { x: 0, y: 0 });
    addState(automaton, 's2', { x: 10, y: 10 });
    updateTransitions(automaton, { from: 's1', to: 's1', symbol: '' }, 'a,b', 1);
    updateTransitions(automaton, { from: 's1', to: 's2', symbol: '' }, 'c');

    expect(automaton.transitions).toHaveLength(3);
    removeTransition(automaton, 's1-s1');
    expect(automaton.transitions).toHaveLength(1);
});
