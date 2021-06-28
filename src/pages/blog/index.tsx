import React from 'react';
import useSWR from 'swr';
import { List, Card, Tag, Select, Space, Button } from 'antd';
import { SyncOutlined, HighlightOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import moment from 'moment';

import styles from './index.less';
import RootContext from '@/context';
import FullSpin from '@/components/FullSpin';

export default () => {
  const { dateFormat } = React.useContext(RootContext);
  const [tag, setTag] = React.useState('');
  const { data: list, isValidating } = useSWR<{
    articles: {
      title: string;
      hide: boolean;
      introduction: string;
      thumbnail: string;
      tags: string[];
      createTime: number;
    }[];
  }>('/data/list.json');

  const articles = list?.articles || [];

  const devMode = process.env.NODE_ENV !== 'production';

  // ======================== Tags ========================
  const tagList = React.useMemo(() => {
    const tagSet = new Set<string>();

    (articles || []).forEach(({ tags = [] }) => {
      tags.forEach((t) => {
        tagSet.add(t);
      });
    });

    const rawList = Array.from(tagSet);

    return [
      {
        label: '-- 所有标签 --',
        value: '',
      },
      ...rawList.map((tag) => ({ label: tag, value: tag })),
    ];
  }, [articles]);

  // ======================== List ========================
  const filteredList = React.useMemo(() => {
    let currentList = articles;

    if (!devMode) {
      currentList = currentList.filter((article) => !article.hide);
    }

    if (tag) {
      currentList = currentList.filter((report) => report.tags?.includes(tag));
    }

    return currentList;
  }, [list, tag]);

  // ======================== Load ========================
  if (!list) {
    return <FullSpin />;
  }

  // ======================= Render =======================
  const $extra = (
    <Space>
      <Select
        size="small"
        style={{ width: 130 }}
        value={tag}
        onChange={setTag}
        options={tagList}
      />
      {devMode && (
        <Link to="/blog/new">
          <Button type="primary" size="small" icon={<HighlightOutlined />}>
            创建日志
          </Button>
        </Link>
      )}
    </Space>
  );

  return (
    <div>
      <Card
        title={<Space>阳光不锈{isValidating && <SyncOutlined spin />}</Space>}
        extra={$extra}
      >
        <List
          itemLayout="vertical"
          className={styles.list}
          size="large"
          pagination={{ pageSize: 10 }}
          dataSource={filteredList}
          renderItem={({
            createTime,
            title,
            introduction,
            thumbnail,
            tags,
            hide,
          }) => (
            <List.Item
              key={createTime}
              extra={
                thumbnail && (
                  <Link to={`/blog/${createTime}`}>
                    <img
                      width={272}
                      alt={title}
                      src={`/${thumbnail}`}
                      style={{ maxHeight: 250, objectFit: 'cover' }}
                    />
                  </Link>
                )
              }
            >
              <List.Item.Meta
                title={
                  <span style={{ opacity: hide ? 0.5 : undefined }}>
                    <Link to={`/blog/${createTime}`} className={styles.title}>
                      {title}
                    </Link>

                    <span className={styles.tags}>
                      {tags.map((tag) => (
                        <Tag
                          key={tag}
                          onClick={() => {
                            setTag(tag);
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </span>
                  </span>
                }
                description={
                  <span>{moment(createTime).format(dateFormat)}</span>
                }
              />
              <Link to={`/blog/${createTime}`} className={styles.introduction}>
                {introduction}
              </Link>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
