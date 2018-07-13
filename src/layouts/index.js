import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';

import './index.less';

const { Content, Sider } = Layout;

class Main extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'global/init',
    });
  }

  onCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/triggerCollapse',
      collapsed,
    });
  };

  render() {
    const { isDev, children, pathname, collapsed } = this.props;

    let $adminMenu;

    if (isDev) {
      $adminMenu = [
        <Menu.Item key="/config">
          <Link to="/config">
            <Icon type="setting" />
            <span className="nav-text">配置</span>
          </Link>
        </Menu.Item>,
        <Menu.Item key="/blog/new">
          <Link to="/blog/new">
            <Icon type="file-text" />
            <span className="nav-text">新建文章</span>
          </Link>
        </Menu.Item>,
        <Menu.Divider key="dvd" />,
      ];
    }

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          onCollapse={this.onCollapse}
          collapsed={collapsed}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" selectedKeys={[pathname]}>
            {$adminMenu}
            
            <Menu.Item key="/blog">
              <Link to="/blog">
                <Icon type={pathname === '/blog' ? 'folder-open' : 'folder'} />
                <span className="nav-text">博客</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          {/* <Header style={{ background: '#fff', padding: 0 }} /> */}
          <Content style={{ padding: '24px 16px 0', overflow: 'initial', minHeight: '100vh' }}>
            {children}
          </Content>
          {/* <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2016 Created by Ant UED
          </Footer> */}
        </Layout>
      </Layout>
    );
  }
}

const mapState = ({ global: { isDev, pathname, collapsed } }) => ({
  isDev,
  pathname,
  collapsed,
});

export default connect(mapState)(Main);