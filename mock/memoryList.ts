import fse from 'fs-extra';
import type { Request, Response } from 'express';

export default {
  'get /data/memoryList.json': function (_: Request, res: Response) {
    fse
      .readJson('./data/memoryList.json')
      .then((json) => {
        setTimeout(() => {
          res.json(json);
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
        res.json(err);
      });
  },

  'post /data/memories/save': function (req: Request, res: Response) {
    const json = {
      memories: req.body,
    };

    fse
      .writeFile(
        './data/memoryList.json',
        JSON.stringify(json, null, '\t'),
        'utf8',
      )
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false });
      });
  },
};
