import fse from 'fs-extra';

export default {
  'get /data/list.json': function (_, res) {
    fse.readJson('./data/list.json')
      .then(json => {
        setTimeout(() => {
          res.json(json);
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        res.json(err);
      })
  }
}