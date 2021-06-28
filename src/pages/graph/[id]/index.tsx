import React from 'react';
import { Modal, message } from 'antd';
import useSWR, { mutate } from 'swr';
import { history } from 'umi';
import FullSpin from '@/components/FullSpin';
import LinkGraph, { LinkGraphInfo, Note } from '../components/LinkGraph';

export default (props: { match: { params: { id: string } } }) => {
  const {
    match: {
      params: { id },
    },
  } = props;

  const url = `/data/graphs/${id}.json`;

  const { data, isValidating } = useSWR<{
    title: string;
    content: Note[];
    createTime: number;
  }>(url);

  if (!data) {
    return <FullSpin />;
  }

  const onSave = async (info: LinkGraphInfo) => {
    fetch('/data/graphs/edit', {
      method: 'POST',
      body: JSON.stringify({
        ...info,
        createTime: data.createTime,
      }),
      headers: {
        'content-type': 'application/json',
      },
    }).then(() => {
      message.success('保存成功！');
      mutate(url);
    });
  };

  const onDelete = () => {
    Modal.confirm({
      title: '确认',
      content: '确定删除吗？',
      onOk: () => {
        fetch(`/data/graphs/delete/${data.createTime}`, {
          method: 'DELETE',
        }).then(() => {
          history.push('/graph');
        });
      },
    });
  };

  return (
    <LinkGraph
      editable={process.env.NODE_ENV !== 'production'}
      notes={data?.content}
      title={data.title}
      createTime={data.createTime}
      onSave={onSave}
      onDelete={onDelete}
      refreshing={isValidating}
    />
  );
};
