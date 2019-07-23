import React from 'react';
import {
    Layout,
    Menu,
    Input,
} from 'antd';

import './RegularLanguage.css';

const RegularLanguage: React.FC = () => {
    return (
        <Layout>
            <h1>Regular language</h1>
            <Input size="large" placeholder="What is your regular language expression?" />
            <h1>Test strings</h1>
            <div className="field accept">
                <h2>Accept</h2>
                <Input.TextArea rows={8} />
            </div>
            <div className="field reject">
                <h2>Reject</h2>
                <Input.TextArea rows={8} />
            </div>
        </Layout>
    );
}

export default RegularLanguage;
