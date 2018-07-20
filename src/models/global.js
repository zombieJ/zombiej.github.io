import request from '../utils/request';

const updateTitle = (title) => {
  document.title = title;
};

const model = {
  namespace: 'global',
  state: {
    title: '-',
    abbrTitle: '',
    dateFormat: 'YYYY-MM-DD',
    collapse: false,
    isMobile: true,
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
        type: 'updateState',
        ...config,
      });

      updateTitle(config.title);
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
      return {
        ...state,
        collapsed,
      };
    },
    resize(state, { width }) {
      return {
        ...state,
        isMobile: width < 600,
      };
    },
  },
};

updateTitle(model.state.title);

// 添加开发需要控制
if (process.env.NODE_ENV === 'development') {
  model.effects = {
    ...model.effects,

    *updateConfig(action, { put, call }) {
      const { ...config } = action;
      delete config.type;

      updateTitle(config.title);

      yield call(request, '/data/config/save', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config),
      });

      yield put({
        ...config,
        type: 'updateState',
      });
    },
  };
}

export default model;