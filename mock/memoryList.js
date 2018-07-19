import fse from 'fs-extra';

export default {
  'get /data/memoryList.json': function (_, res) {
    fse.readJson('./data/memoryList.json')
      .then(json => {
        setTimeout(() => {
          res.json(json);
        }, 1000);
      })
      .catch(err => {
        console.error(err);
        res.json(err);
      })
  },

  'post /data/memories/new': function(req, res) {
    const createTime = Date.now();

    const { title, description, thumbnail } = req.body;

    fse.readJson('./data/memoryList.json')
      .then((json) => {
        json.memories.push({ title, description, thumbnail });

        return fse.writeFile('./data/memoryList.json', JSON.stringify(json, null, '\t'), 'utf8')
      })
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  },
}