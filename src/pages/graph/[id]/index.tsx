import React from 'react';
import useSWR from 'swr';
import FullSpin from '@/components/FullSpin';
import LinkGraph, { Note } from '../components/LinkGraph';

export default (props: { match: { params: { id: string } } }) => {
  const {
    match: {
      params: { id },
    },
  } = props;
  const { data } = useSWR<{ content: Note[] }>(`/data/graphs/${id}.json`);

  if (!data) {
    return <FullSpin />;
  }

  return (
    <LinkGraph
      editable={process.env.NODE_ENV !== 'production'}
      notes={data?.content}
    />
  );
};
