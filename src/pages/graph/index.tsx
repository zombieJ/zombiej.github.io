import React from 'react';
import { Card, List, Button } from 'antd';
import { DotChartOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { Link } from 'umi';
import LinkGraph from './components/LinkGraph';

export default function Graph() {
  const { data: list, isValidating } = useSWR<{
    graphs: {
      title: string;
      hide: boolean;
      introduction: string;
      tags: string[];
      createTime: number;
    }[];
  }>('/data/list.json');

  return (
    <Card
      title="可视"
      extra={
        process.env.NODE_ENV !== 'production' && (
          <Link to={`/graph/new`}>
            <Button size="small" type="primary">
              <DotChartOutlined />
              创建纪要
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
            <List.Item.Meta title={title} description={introduction} />
          </List.Item>
        )}
      />
    </Card>
  );
}
