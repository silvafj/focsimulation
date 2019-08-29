import React from 'react';
import ReactDOM from 'react-dom';
import noam from 'noam';
import { TestWords } from '../test-words';

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TestWords
        automaton={noam.fsm.makeNew()}
        words={[]}
        testAccept={false}
    />, div);
    ReactDOM.unmountComponentAtNode(div);
});
