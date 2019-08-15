import React from 'react';
import { Layout, Menu } from 'antd';
import { BrowserRouter, Route, Link, withRouter } from 'react-router-dom';

import RegularLanguage from '../../routes/regular-language';
import Automata from '../../routes/automata';

import logo from '../../assets/logo.svg';

import './app.css';

const { Header, Sider, Content } = Layout;

function getKeyFromLocation(pathname: string): string {
  if (pathname === '/') {
    return 'automata';
  }

  return pathname.substr(1);
}

const SiderWithRouter = withRouter(({ location, ...props }) => (
  <Sider width="300px">
    <Menu theme="dark" selectedKeys={[getKeyFromLocation(location.pathname)]}>
      <Menu.Item key="automata">
        <Link to="/automata">Automata</Link>
      </Menu.Item>
      <Menu.Item key="regular-language">
        <Link to="/regular-language">Regular language</Link>
      </Menu.Item>
    </Menu>
  </Sider>
));

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
        <SiderWithRouter />
        <Content>
          <Route exact path={["/", "/automata"]} component={Automata} />
          <Route exact path={["/regular-language"]} component={RegularLanguage} />
        </Content>
      </Layout>
    </BrowserRouter>
  );
}