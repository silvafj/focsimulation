import React from 'react';
import {
  Layout,
  Menu,
} from 'antd';

import RegularLanguage from './RegularLanguage';
import logo from '../assets/logo.svg';

import './App.css';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout>
      <Header>
        <div className="logo">
          <img src={logo} className="icon" alt="logo" />
          <a href="">Fundamentals of Computing</a>
        </div>
        <div className="links">
          <a href="https://github.com/silvafj/focsimulation">GitHub</a>
          <a href="http://www.dcs.bbk.ac.uk/~michael/foc/foc.html">Course</a>
        </div>
      </Header>
      <Sider width="300px">
        <Menu theme="dark" defaultSelectedKeys={['reglang']}>
          <Menu.Item key="reglang">Regular languages</Menu.Item>
          <Menu.Item key="automata">Automata</Menu.Item>
        </Menu>
      </Sider>
      <Content>
        <RegularLanguage />
      </Content>
    </Layout>
  );
}

export default App;
