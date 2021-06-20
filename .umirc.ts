import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  locale: {
    default: 'zh-CN',
  },
  fastRefresh: {},
  history: {
    type: 'hash',
  },
});
