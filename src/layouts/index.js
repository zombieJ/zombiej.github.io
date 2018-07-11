import React from 'react';
import { Layout, Menu, Icon, Switch } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';

const { Header, Content, Footer, Sider } = Layout;

class Main extends React.Component {
  render() {
    const { isDev, children } = this.props;

    return (
      <Layout>
        <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            {isDev &&
              <Menu.Item key="config">
                <Link to="/config">
                  <Icon type="setting" />
                  <span className="nav-text">配置</span>
                </Link>
              </Menu.Item>
            }
            <Menu.Item key="blog">
              <Link to="/blog">
                <Icon type="folder" />
                <span className="nav-text">博客</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
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

const mapState = ({ global: { isDev } }) => ({
  isDev,
});

export default connect(mapState)(Main);