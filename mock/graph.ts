import fse from 'fs-extra';
import Path from 'path';
import type { Request, Response } from 'express';
import { refreshList } from './util';

async function saveGraph(createTime: number, reqBody: Request['body']) {
  const { content, title, tags, hide } = reqBody;

  const article = {
    title,
    tags,
    hide,
    content,
    createTime,
  };

  return fse
    .writeFile(
      `./data/graphs/${createTime}.json`,
      JSON.stringify(article, null, '\t'),
      'utf8',
    )
    .then(() => article);
}

export default {
  'get /data/graphs/refresh': function (_: Request, res: Response) {
    refreshList()
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.error(err);
        res.json({ success: false });
      });
  },

  'get /data/graphs/:file': function (req: Request, res: Response) {
    setTimeout(() => {
      res.sendFile(Path.resolve(`./data/graphs/${req.params.file}`));
    }, 1000);
  },

  'post /data/graphs/new': function (req: Request, res: Response) {
    const createTime = Date.now();

    saveGraph(createTime, req.body)
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

  'post /data/graphs/edit': function (req: Request, res: Response) {
    const createTime = req.body.createTime;

    saveGraph(createTime, req.body)
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

  'delete /data/graphs/delete/:id': function (req: Request, res: Response) {
    const { id } = req.params;

    console.log('Delete article:', id);

    fse
      .unlink(`./data/graphs/${id}.json`)
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
