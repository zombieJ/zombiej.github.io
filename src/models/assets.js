import request from '../utils/request';

let model;

// 添加开发需要控制
if (process.env.NODE_ENV === 'development') {
  const getBase64 = function (file) {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
    });
  }
  
  model = {
    namespace: 'assets',
    state: {},
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
  };
} else {
  model = {
    namespace: 'assets',
    state: {},
  };
}

export default model;