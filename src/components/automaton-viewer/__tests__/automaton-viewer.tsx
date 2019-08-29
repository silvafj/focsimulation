import React from 'react';
import ReactDOM from 'react-dom';
import noam from 'noam';
import { AutomatonViewer } from '../automaton-viewer';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AutomatonViewer automaton={noam.fsm.makeNew()} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
