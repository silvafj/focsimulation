import React from 'react';
import ReactDOM from 'react-dom';
import { RegularLanguage } from '../regular-language';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RegularLanguage />, div);
  ReactDOM.unmountComponentAtNode(div);
});
