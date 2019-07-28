import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter, Route, Link } from "react-router-dom";

import RegularLanguage from '../../routes/regular-language';
import Automata from '../../routes/automata';

import logo from '../../assets/logo.svg';

import './app.css';

const { Header, Sider, Content } = Layout;

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Header>
          <div className="logo">
            <img src={logo} className="icon" alt="logo" />
            <a href=".">Fundamentals of Computing</a>
          </div>
          <div className="links">
            <a href="https://github.com/silvafj/focsimulation">GitHub</a>
            <a href="http://www.dcs.bbk.ac.uk/~michael/foc/foc.html">Course</a>
          </div>
        </Header>
        <Sider width="300px">
          <Menu theme="dark" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to="/regular-language">Regular language</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/automata">Automata</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Content>
          <Route exact path={["/", "/regular-language"]} component={RegularLanguage} />
          <Route exact path="/automata" component={Automata} />
        </Content>
      </Layout>
    </BrowserRouter>
  );
}