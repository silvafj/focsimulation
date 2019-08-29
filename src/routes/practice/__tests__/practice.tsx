import React from 'react';
import ReactDOM from 'react-dom';
import { Practice } from '../practice';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Practice />, div);
  ReactDOM.unmountComponentAtNode(div);
});
