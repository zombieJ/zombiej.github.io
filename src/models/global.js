// import { routerRedux } from 'dva/router';
import request from '../utils/request';

const updateTitle = (title) => {
  document.title = title;
};

const model = {
  namespace: 'global',
  state: {
    isDev: process.env.NODE_ENV === 'development',
    title: '-',
    dateFormat: 'YYYY-MM-DD',
    collapse: false,
  },
  subscriptions: {
    setup({ history, dispatch }) {
      history.listen(({ pathname }) => {
        dispatch({
          type: 'updateState',
          pathname,
        });
      });
    },
  },
  effects: {
    *init(_, { call, put }) {
      const config = yield call(request, '/data/config.json');
      yield put({
        type: 'updateConfig',
        ...config,
      });
    },
    *updateConfig(config, { put }) {
      updateTitle(config.title);

      yield put({
        ...config,
        type: 'updateState',
      });
    },
  },
  reducers: {
    updateState(state, newState) {
      const my = { ...newState };
      delete my.type;

      return {
        ...state,
        ...my,
      };
    },
    triggerCollapse(state, { collapsed }) {
      console.log('....', collapsed);
      return {
        ...state,
        collapsed,
      };
    }
  },
};

updateTitle(model.state.title);

export default model;