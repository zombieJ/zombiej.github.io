import React from 'react';
import useSWR from 'swr';
import {
  SmileOutlined,
  MehOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useLocation, Link } from 'umi';
import { Layout, Menu } from 'antd';
import isMobile from 'rc-util/es/isMobile';

import styles from './index.less';
import RootContext from '@/context';
import FullSpin from '@/components/FullSpin';

const { Content, Sider, Header } = Layout;

const mobile = isMobile();

interface LayoutProps {
  children: React.ReactNode;
}

export default ({ children }: LayoutProps) => {
  const { pathname } = useLocation();

  const [collapsed, setCollapsed] = React.useState(false);

  const { data: config } = useSWR<{
    title: string;
    abbrTitle: string;
    dateFormat: string;
  }>('/data/config.json');

  // ============================= Empty ==============================
  if (!config) {
    return <FullSpin />;
  }

  // ============================= Render =============================
  // >>>>> AdminMenu
  let $adminMenu: React.ReactNode;

  if (process.env.NODE_ENV === 'development' && !mobile) {
    $adminMenu = [
      <Menu.Item key="/config" title="配置">
        <Link to="/config">
          <SettingOutlined />
          <span className="nav-text">配置</span>
        </Link>
      </Menu.Item>,
      <Menu.Item key="/blog/new" title="新建文章">
        <Link to="/blog/new">
          <FileTextOutlined />
          <span className="nav-text">新建文章</span>
        </Link>
      </Menu.Item>,
      <Menu.Divider key="dvd" />,
    ];
  }

  // >>>>> Menu
  const $menu = (
    <Menu
      theme="dark"
      mode={mobile ? 'horizontal' : 'inline'}
      selectedKeys={[pathname]}
      style={mobile ? { lineHeight: '64px' } : {}}
      disabledOverflow
    >
      {$adminMenu}

      <Menu.Item key="/blog" title="博客">
        <Link to="/blog">
          {pathname === '/blog' ? <FolderOpenOutlined /> : <FolderOutlined />}
          <span className="nav-text">博客</span>
        </Link>
      </Menu.Item>

      <Menu.Item key="/memory" title="回忆">
        <Link to="/memory">
          {pathname === '/memory' ? <SmileOutlined /> : <MehOutlined />}
          <span className="nav-text">回忆</span>
        </Link>
      </Menu.Item>
    </Menu>
  );

  // >>>>> Render
  let content: React.ReactNode;

  if (mobile) {
    content = (
      <Layout>
        <Header className={styles.mobileHeader}>
          <div className={styles.logo}>{config?.abbrTitle}</div>
          {$menu}
        </Header>
        <Content style={{ padding: '0', background: '#FFF' }}>
          {children}
        </Content>
      </Layout>
    );
  } else {
    content = (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible onCollapse={setCollapsed} collapsed={collapsed}>
          <div className={styles.logo}>
            {collapsed ? config?.abbrTitle : config?.title}
          </div>
          {$menu}
        </Sider>
        <Layout>
          <Content
            style={{
              padding: '24px 16px 0',
              overflow: 'initial',
              minHeight: '100vh',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <RootContext.Provider
      value={{
        ...config,
        setCollapsed,
        mobile,
      }}
    >
      {content}
    </RootContext.Provider>
  );
};
