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

  console.log('~~~>', data);

  if (!data) {
    return <FullSpin />;
  }

  return <LinkGraph notes={data?.content} />;
};
