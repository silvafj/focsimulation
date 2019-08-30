import React from 'react';
import ReactDOM from 'react-dom';
import noam from 'noam';
import { AutomatonViewer } from '../automaton-viewer';
import { addState, setAcceptingState, updateTransitions } from '../../automaton-designer/helpers';

it('renders without crashing', () => {
  const automaton = noam.fsm.makeNew();
  addState(automaton, 's1', { x: 50, y: 50 });
  addState(automaton, 's2', { x: 100, y: 100 });
  automaton.initialState = 's1';
  setAcceptingState(automaton, 's1', true);
  updateTransitions(automaton, { from: 's1', to: 's1', symbol: 'a,c,d,e' }, 'a,b', 1);
  updateTransitions(automaton, { from: 's1', to: 's2', symbol: '' }, 'c');

  const div = document.createElement('div');
  ReactDOM.render(<AutomatonViewer automaton={automaton} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
