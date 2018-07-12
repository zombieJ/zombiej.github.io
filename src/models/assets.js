import request from '../utils/request';

function getBase64(file) {
  return new Promise((resolve) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result);
    };
  });
}

export default {
  namespace: 'assets',
  state: {
    list: undefined,
    articles: {},
  },
  effects: {
    *upload({ files }, { call, put }) {
      const file = files[0];
      const base64 = yield getBase64(file);

      const result = yield call(request, '/data/assets/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: file.name,
          base64,
        }),
      });
      
      return result;
    },
  },
  reducers: {
  },
};