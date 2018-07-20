import request from '../utils/request';

const model = {
  namespace: 'article',
  state: {
    list: undefined,
    articles: {},
  },
  effects: {
    *loadList(_, { call, put }) {
      const { articles } = yield call(request, '/data/list.json');
      yield put({
        type: 'updateState',
        list: articles,
      });
    },

    *loadArticle({ id }, { call, put }) {
      const article = yield call(request, `/data/articles/${id}.json`);

      yield put({
        type: 'updateArticle',
        article,
        id,
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

    updateArticle(state, { article, id }) {
      return {
        ...state,
        articles: {
          ...state.articles,
          [id]: article,
        },
      };
    },
  },
};

// 添加开发需要控制
if (process.env.NODE_ENV === 'development') {
  model.effects = {
    ...model.effects,

    *saveArticle(action, { call }) {
      yield call(request, '/data/articles/new', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action),
      });
    },

    *editArticle(action, { call }) {
      yield call(request, '/data/articles/edit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action),
      });
    },

    *deleteArticle({ id }, { call, put }) {
      yield call(request, `/data/articles/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
    },
  };
}

export default model;