import request from '../utils/request';

const model = {
  namespace: 'memory',
  state: {
    list: undefined,
  },
  effects: {
    *loadList(_, { call, put }) {
      const { memories } = yield call(request, '/data/memoryList.json');
      yield put({
        type: 'updateState',
        list: memories,
      });
    },

    *saveMemories(action, { call }) {
      yield call(request, '/data/memories/save', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action.list),
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
  },
};

export default model;