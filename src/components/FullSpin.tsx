import React from 'react';
import { Spin } from 'antd';

export default function FullSpin() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 48 }}>
      <Spin size="large" />
    </div>
  );
}
