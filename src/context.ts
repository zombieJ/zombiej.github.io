import React from 'react';

const RootContext = React.createContext<{
  title: string;
  abbrTitle: string;
  dateFormat: string;
  setCollapsed: (collapsed: boolean) => void;
  mobile: boolean;
}>(null as any);

export default RootContext;
