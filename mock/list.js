import fse from 'fs-extra';

export default {
  'get /data/list.json': function (_, res) {
    fse.readJson('./data/list.json')
      .then(json => {
        res.json(json);
      })
      .catch(err => {
        console.error(err);
        res.json(err);
      })
  }
}