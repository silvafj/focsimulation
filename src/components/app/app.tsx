import React, { useEffect } from 'react';
import {
  HashRouter,
  Link,
  Route,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import ReactGA, { FieldsObject } from 'react-ga';
import { Layout, Menu } from 'antd';

import Automaton from '../../routes/automaton';
import Practice from '../../routes/practice';
import RegularLanguage from '../../routes/regular-language';

import logo from '../../assets/logo.svg';

import './app.css';

const { Header, Sider, Content } = Layout;

ReactGA.initialize('UA-50201175-2', { testMode: process.env.NODE_ENV !== 'production' });

const withTracker = <P extends RouteComponentProps>(
  WrappedComponent: React.ComponentType<P>,
  options: FieldsObject = {},
) => {
  const trackPage = (page: string) => {
    ReactGA.set({ page, ...options });
    ReactGA.pageview(page);
  };

  return (props: P) => {
    useEffect(() => {
      trackPage(props.location.pathname);
    }, [props.location.pathname]);

    return <WrappedComponent {...props} />;
  };
};

function getKeyFromLocation(pathname: string): string {
  if (pathname === '/') {
    return 'automaton';
  }

  return pathname.substr(1);
}

const SiderWithRouter = withRouter(({ location }) => (
  <Sider width="300px">
    <Menu theme="dark" selectedKeys={[getKeyFromLocation(location.pathname)]}>
      <Menu.Item key="automaton">
        <Link to="/automaton">Automaton</Link>
      </Menu.Item>
      <Menu.Item key="regular-language">
        <Link to="/regular-language">Regular language</Link>
      </Menu.Item>
      <Menu.Item key="practice">
        <Link to="/practice">Practice questions</Link>
      </Menu.Item>
    </Menu>
  </Sider>
));

export const App: React.FC = () => (
  <HashRouter>
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
        <Route exact path={['/', '/automaton']} component={withTracker(Automaton)} />
        <Route exact path={['/regular-language']} component={withTracker(RegularLanguage)} />
        <Route exact path={['/practice']} component={withTracker(Practice)} />
      </Content>
    </Layout>
  </HashRouter>
);
