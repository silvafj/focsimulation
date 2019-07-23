import React from 'react';
import {
  Layout,
  Menu,
} from 'antd';

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
      <Layout>
        <Sider width="300px">
          <Menu theme="dark" defaultSelectedKeys={['reglang']}>
            <Menu.Item key="reglang">Regular languages</Menu.Item>
            <Menu.Item key="automata">Automata</Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content>
          <img src={logo} className="app-logo-icon" alt="logo" />
            
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
        </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </Content>
        </Layout>

      </Layout>
    </Layout>
  );
}

export default App;
