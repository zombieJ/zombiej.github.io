import React from 'react';
import { Card, List, Button, Space } from 'antd';
import { DotChartOutlined, SyncOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { Link } from 'umi';
import moment from 'moment';
import RootContext from '@/context';
import FullSpin from '@/components/FullSpin';
import styles from './index.less';

export default function Graph() {
  const { dateFormat } = React.useContext(RootContext);

  const { data: list, isValidating } = useSWR<{
    graphs: {
      title: string;
      hide: boolean;
      introduction: string;
      tags: string[];
      createTime: number;
    }[];
  }>('/data/list.json');

  if (!list) {
    return <FullSpin />;
  }

  return (
    <Card
      title={
        <Space>
          笔记
          {isValidating && <SyncOutlined spin />}
        </Space>
      }
      extra={
        process.env.NODE_ENV !== 'production' && (
          <Link to={`/graph/new`}>
            <Button size="small" type="primary">
              <DotChartOutlined />
              创建笔记
            </Button>
          </Link>
        )
      }
    >
      <List
        size="small"
        pagination={{ pageSize: 20 }}
        dataSource={list?.graphs || []}
        renderItem={({ createTime, title, introduction, tags, hide }) => (
          <List.Item key={createTime}>
            <Link to={`/graph/${createTime}`} className={styles.link}>
              <List.Item.Meta
                title={title || moment(createTime).format(dateFormat)}
                description={introduction}
              />
            </Link>
          </List.Item>
        )}
      />
    </Card>
  );
}
