import fse from 'fs-extra';

export default {
  'get /data/articles/:id': function(req, res) {
    setTimeout(() => {
      res.sendfile(`./data/articles/${req.params.id}.json`);
    }, 1000);
  },

  'post /data/articles/new': function(req, res) {
    const { content, title, tags } = req.body;

    const article = {
      title,
      tags,
      content,
      createTime: Date.now(),
    };

    res.json({ success: true, article });
  },
};