import React from 'react';
import LinkGraph, { Note } from '../components/LinkGraph';

export default function New() {
  const onSave = async (notes: Note[]) => {
    fetch('/data/graphs/new', {
      method: 'POST',
      body: JSON.stringify({
        content: notes,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  return <LinkGraph editable onSave={onSave} />;
}
