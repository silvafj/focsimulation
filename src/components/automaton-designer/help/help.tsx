import React from 'react';
import { Icon, Popover } from 'antd';

import './help.css';

export const Help: React.FC<{
    open: boolean;
}> = ({ open }) => {
  const actions: Map<string, JSX.Element> = new Map([
    ['Add a state', <>
      <kbd>🖰 double click</kbd>
      {' '}
on empty canvas
    </>],
    ['Toggle accept state', <>
      <kbd>🖰 double click</kbd>
      {' '}
or
      {' '}
      <kbd>
        <kbd>shift</kbd>
        {' '}
+
        {' '}
        <kbd>a</kbd>
      </kbd>
                            </>],
    ['Mark state as initial', <>
      <kbd>
        <kbd>shift</kbd>
        {' '}
+
        {' '}
        <kbd>i</kbd>
      </kbd>
    </>],
    ['Move a state', <>
      <kbd>🖰 click</kbd>
      {' '}
and drag
    </>],
    ['Add a transition', <>
      <kbd>
        <kbd>shift</kbd>
        {' '}
+
        {' '}
        <kbd>🖰 click</kbd>
      </kbd>
      {' '}
and drag
    </>],
    ['Delete a state or transition', <><kbd>delete</kbd></>],
    ['Update a transition symbol', <><kbd>🖰 double click</kbd></>],
  ]);

  return (
    <Popover
      placement="rightTop"
      title="How to use the automaton designer?"
      defaultVisible={open}
      overlayClassName="automaton-designer-help"
      content={(
        <ul>
          {
                    Array.from(actions, ([action, hint], i) => (
                      <li key={i}>
                        <span className="action">{action}</span>
                        <span className="hint">{hint}</span>
                      </li>
                    ))
                }
        </ul>
)}
    >
      <Icon type="question-circle" />
    </Popover>
  );
};
