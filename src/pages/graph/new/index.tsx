import React from 'react';
import { message } from 'antd';
import { history } from 'umi';
import LinkGraph, { LinkGraphInfo } from '../components/LinkGraph';

export default function New() {
  const onSave = async (info: LinkGraphInfo) => {
    fetch('/data/graphs/new', {
      method: 'POST',
      body: JSON.stringify(info),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        message.success('保存成功！');
        history.replace(`/graph/${data.graph.createTime}`);
      });
  };

  return <LinkGraph editable onSave={onSave} />;
}
