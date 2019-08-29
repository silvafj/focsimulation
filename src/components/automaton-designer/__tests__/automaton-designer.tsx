import React from 'react';
import ReactDOM from 'react-dom';
import noam from 'noam';
import { AutomatonDesigner } from '../automaton-designer';
import { addState } from '../helpers';

it('renders without crashing', () => {
    const automaton = noam.fsm.makeNew();
    addState(automaton, 's1', { x: 50, y: 50 });
    addState(automaton, 's2', { x: 100, y: 100 });

    const div = document.createElement('div');
    ReactDOM.render(<AutomatonDesigner automaton={automaton} />, div);
    ReactDOM.unmountComponentAtNode(div);
});
