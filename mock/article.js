import fse from 'fs-extra';
import { refreshList } from './util';

export default {
  'get /data/articles/refresh': function(_, res) {
    refreshList().then(() => {
      res.json({ success: true });
    }).catch((err) => {
      console.error(err);
      res.json({ success: false });
    });
  },

  'get /data/articles/:id': function(req, res) {
    setTimeout(() => {
      res.sendfile(`./data/articles/${req.params.id}.json`);
    }, 1000);
  },

  'post /data/articles/new': function(req, res) {
    const { content, title, tags } = req.body;

    const createTime = Date.now();

    const thumbnailMatch = content.match(/!\[[^\]]*]\(([^)]*)\)/);
    let thumbnail;

    if (thumbnailMatch) {
      thumbnail = thumbnailMatch[1];
    }

    const article = {
      title,
      tags,
      content: content.trim(),
      createTime,
      thumbnail,
    };

    console.log('Save article:', article);

    fse
      .writeFile(`./data/articles/${createTime}.json`, JSON.stringify(article, null, '\t'), 'utf8')
      .then(() => {
        res.json({ success: true, article });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  },
};