import React from 'react';
import { Icon, Popover } from 'antd';

import './help.css';

export const Help: React.FC = () => {
    const content = (
        <div className="automaton-designer-help">
            <ul>
                <li><span className="action">Add a state</span> <span className="hint"><kbd>🖰 double click</kbd> on empty canvas</span></li>
                <li><span className="action">Toggle accept state</span> <span className="hint"><kbd>🖰 double click</kbd> or <kbd><kbd>shift</kbd> + <kbd>a</kbd></kbd></span></li>
                <li><span className="action">Mark state as initial</span> <span className="hint"><kbd><kbd>shift</kbd> + <kbd>i</kbd></kbd></span></li>
                <li><span className="action">Move a state</span> <span className="hint"><kbd>🖰 click</kbd> and drag</span></li>
                <li><span className="action">Add a transition</span> <span className="hint"><kbd><kbd>shift</kbd> + <kbd>🖰 click</kbd></kbd> and drag</span></li>
                <li><span className="action">Delete a state or transition</span> <span className="hint"><kbd>delete</kbd></span></li>
                <li><span className="action">Update a transition symbol</span> <span className="hint"><kbd>🖰 double click</kbd></span></li>
            </ul >
        </div >
    );

    return (
        <Popover placement="rightTop"
            title="How to use the automaton designer?"
            content={content}>
            <Icon type="question-circle" />
        </Popover>
    );
}