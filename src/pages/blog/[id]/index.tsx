import React from 'react';
import useSwr from 'swr';
import { Tag, Card, Modal, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import marked from 'marked';
import moment from 'moment';
import { history } from 'umi';
// import router from 'umi/router';

import styles from './index.less';
import FullSpin from '@/components/FullSpin';
import RootContext from '@/context';

export interface Article {
  content: string;
  title: string;
  tags: string[];
  createTime: number;
  thumbnail: string;
  hide: boolean;
}

export default (props: { match: { params: { id: string } } }) => {
  const {
    match: {
      params: { id },
    },
  } = props;

  const { dateFormat } = React.useContext(RootContext);

  const { data: article } = useSwr<Article>(`/data/articles/${id}.json`);

  // =============================== HTML ===============================
  const html = React.useMemo(() => {
    return marked(article?.content || '');
  }, [article]);

  // ============================= Delete ===============================
  const onDelete = () => {
    Modal.confirm({
      title: 'Are you sure delete this article?',
      okType: 'danger',
      maskClosable: true,
      onOk() {
        fetch(`/data/articles/delete/${article?.createTime}`, {
          method: 'DELETE',
        }).then(async () => {
          history.push('/blog');
        });
      },
    });
  };

  // ============================== Empty ===============================
  if (!article) {
    return <FullSpin />;
  }

  // ============================== Render ==============================
  // >>>>> Operation
  let $extra;
  if (process.env.NODE_ENV === 'development') {
    $extra = (
      <Space split="|" wrap={false}>
        <a
          onClick={() => {
            history.push(`/blog/${article.createTime}/edit`);
          }}
        >
          <EditOutlined /> 编辑
        </a>
        <a style={{ color: '#f5222d' }} onClick={onDelete}>
          <DeleteOutlined /> 删除
        </a>
      </Space>
    );
  }

  // >>>>> Render
  return (
    <div>
      <Card title={article.title} extra={$extra}>
        <Space className={styles.prefix} wrap={false} split="|">
          <span className={styles.date}>
            {moment(article.createTime).format(dateFormat)}
          </span>
          <span className={styles.tags}>
            {article.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </span>
        </Space>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </div>
  );
};
