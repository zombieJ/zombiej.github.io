import { routerRedux } from 'dva/router';

const updateTitle = (title) => {
  document.title = title;
};

const model = {
  namespace: 'global',
  state: {
    isDev: process.env.NODE_ENV === 'development',
    title: 'PLACEHOLDER',
    dateFormat: 'YYYY-MM-DD',
  },
  reducers: {
    updateConfig(state, { title, dateFormat }) {
      updateTitle(title);

      return {
        ...state,
        title,
        dateFormat,
      };
    },
  },
};

updateTitle(model.state.title);

export default model;