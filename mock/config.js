import fse from 'fs-extra';

export default {
  'get /data/config.json': function (_, res) {
    fse.readJson('./data/config.json')
      .then(json => {
        res.json(json);
      })
      .catch(err => {
        console.error(err);
        res.json(err);
      })
  }
}