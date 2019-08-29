import React from 'react';
import ReactDOM from 'react-dom';
import { Automaton } from '../automaton';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Automaton />, div);
  ReactDOM.unmountComponentAtNode(div);
});
