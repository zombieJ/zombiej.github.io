import React from 'react';
import useSWR, { mutate } from 'swr';
import FullSpin from '@/components/FullSpin';
import LinkGraph, { Note } from '../components/LinkGraph';

export default (props: { match: { params: { id: string } } }) => {
  const {
    match: {
      params: { id },
    },
  } = props;

  const url = `/data/graphs/${id}.json`;

  const { data, isValidating } = useSWR<{
    content: Note[];
    createTime: number;
  }>(url);

  if (!data) {
    return <FullSpin />;
  }

  const onSave = async (notes: Note[]) => {
    fetch('/data/graphs/edit', {
      method: 'POST',
      body: JSON.stringify({
        createTime: data.createTime,
        content: notes,
      }),
      headers: {
        'content-type': 'application/json',
      },
    }).then(() => {
      mutate(url);
    });
  };

  return (
    <LinkGraph
      editable={process.env.NODE_ENV !== 'production'}
      notes={data?.content}
      createTime={data.createTime}
      onSave={onSave}
      refreshing={isValidating}
    />
  );
};
