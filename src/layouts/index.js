import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';

import { isDev } from '../utils/env';

import './index.less';

const { Content, Sider, Header } = Layout;

class Main extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'global/init',
    });

    window.addEventListener('resize', this.refreshWinSize);
    this.refreshWinSize();
  }

  onCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/triggerCollapse',
      collapsed,
    });
  };

  refreshWinSize = () => {
    this.props.dispatch({
      type: 'global/resize',
      width: window.innerWidth,
    });
  };

  render() {
    const { children, pathname, collapsed, isMobile } = this.props;

    let $adminMenu;

    if (isDev && !isMobile) {
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

    const $menu = (
      <Menu
        theme="dark"
        mode={isMobile ? 'horizontal' : 'inline'}
        selectedKeys={[pathname]}
        style={isMobile ? { lineHeight: '64px' } : {}}
      >
        {$adminMenu}
        
        <Menu.Item key="/blog">
          <Link to="/blog">
            <Icon type={pathname === '/blog' ? 'folder-open' : 'folder'} />
            <span className="nav-text">博客</span>
          </Link>
        </Menu.Item>

        <Menu.Item key="/memory">
          <Link to="/memory">
            <Icon type={pathname === '/memory' ? 'smile-o' : 'meh-o'} />
            <span className="nav-text">回忆</span>
          </Link>
        </Menu.Item>
      </Menu>
    );

    // 宽屏
    if (!isMobile) {
      return (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            collapsible
            onCollapse={this.onCollapse}
            collapsed={collapsed}
          >
            <div className="logo" />
            {$menu}
          </Sider>
          <Layout>
            <Content style={{ padding: '24px 16px 0', overflow: 'initial', minHeight: '100vh' }}>
              {children}
            </Content>
          </Layout>
        </Layout>
      );
    }

    // 移动设备
    return (
      <Layout>
        <Header>
          <div className="logo" />
          {$menu}
        </Header>
        <Content style={{ padding: '0', background: '#FFF' }}>
          {children}
        </Content>
      </Layout>
    );
  }
}

const mapState = ({ global: { pathname, collapsed, isMobile } }) => ({
  pathname,
  collapsed,
  isMobile,
});

export default connect(mapState)(Main);