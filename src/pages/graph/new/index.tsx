import React from 'react';
import LinkGraph, { LinkGraphInfo } from '../components/LinkGraph';

export default function New() {
  const onSave = async (info: LinkGraphInfo) => {
    fetch('/data/graphs/new', {
      method: 'POST',
      body: JSON.stringify(info),
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  return <LinkGraph editable onSave={onSave} />;
}
