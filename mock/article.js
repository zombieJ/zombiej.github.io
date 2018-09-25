import fse from 'fs-extra';
import { refreshList } from './util';
import Path from 'path';

function saveArticle(createTime, reqBody) {
  const { content, title, tags, hide } = reqBody;
  console.log('>>>', title, content);
  const thumbnailMatch = content.match(/!\[[^\]]*]\(([^)]*)\)/);
  let thumbnail;

  if (thumbnailMatch) {
    thumbnail = thumbnailMatch[1];
  }

  const article = {
    title,
    tags,
    hide,
    content: content.trim(),
    createTime,
    thumbnail,
  };

  return fse
    .writeFile(`./data/articles/${createTime}.json`, JSON.stringify(article, null, '\t'), 'utf8')
    .then(() => article)
}

export default {
  'get /data/articles/refresh': function(_, res) {
    refreshList().then(() => {
      res.json({ success: true });
    }).catch((err) => {
      console.error(err);
      res.json({ success: false });
    });
  },

  'get /data/articles/:file': function(req, res) {
    setTimeout(() => {
      res.sendfile(Path.resolve(`./data/articles/${req.params.file}`));
    }, 1000);
  },

  'post /data/articles/new': function(req, res) {
    const createTime = Date.now();

    saveArticle(createTime, req.body)
      .then((article) => {
        console.log('Save article:', article);
        res.json({ success: true, article });
        refreshList();
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  },

  'post /data/articles/edit': function(req, res) {
    const createTime = req.body.createTime;

    saveArticle(createTime, req.body)
      .then((article) => {
        console.log('Update article:', article);
        res.json({ success: true, article });
        refreshList();
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  },

  'delete /data/articles/delete/:id': function(req, res) {
    const { id } = req.params;

    console.log('Delete article:', id);

    fse.unlink(`./data/articles/${id}.json`).then(() => {
      return refreshList().then(() => {
        res.json({ success: true });
      });
    }).catch((err) => {
      console.error(err);
      res.json({ success: false });
    });

    
  },
};