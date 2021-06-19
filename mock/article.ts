import fse from 'fs-extra';
import Path from 'path';
import type { Request, Response } from 'express';
import { refreshList } from './util';

async function saveArticle(createTime: number, reqBody: Request['body']) {
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
    .writeFile(
      `./data/articles/${createTime}.json`,
      JSON.stringify(article, null, '\t'),
      'utf8',
    )
    .then(() => article);
}

export default {
  'get /data/articles/refresh': function (_: Request, res: Response) {
    refreshList()
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false });
      });
  },

  'get /data/articles/:file': function (req: Request, res: Response) {
    setTimeout(() => {
      res.sendfile(Path.resolve(`./data/articles/${req.params.file}`));
    }, 1000);
  },

  'post /data/articles/new': function (req: Request, res: Response) {
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

  'post /data/articles/edit': function (req: Request, res: Response) {
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

  'delete /data/articles/delete/:id': function (req: Request, res: Response) {
    const { id } = req.params;

    console.log('Delete article:', id);

    fse
      .unlink(`./data/articles/${id}.json`)
      .then(() => {
        return refreshList().then(() => {
          res.json({ success: true });
        });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false });
      });
  },
};
