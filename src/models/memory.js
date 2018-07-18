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