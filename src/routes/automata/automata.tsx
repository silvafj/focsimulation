import React, { useState } from 'react';
import { Layout } from 'antd';
import noam from 'noam';

import AutomatonDesigner from '../../components/automaton-designer';

import './automata.css';

export const Automata: React.FC = () => {
    const [automaton, setAutomaton] = useState(noam.fsm.makeNew);

    return (
        <Layout>
            <AutomatonDesigner automaton={automaton} onUpdate={(automaton) => setAutomaton(automaton)} />
        </Layout>
    );
}