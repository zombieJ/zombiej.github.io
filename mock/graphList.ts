import fse from 'fs-extra';
import type { Request, Response } from 'express';

export default {
  'get /data/graphList.json': function (_: Request, res: Response) {
    fse
      .readJson('./data/graphList.json')
      .then((json) => {
        res.json(json);
      })
      .catch((err) => {
        console.error(err);
        res.json(err);
      });
  },

  'post /data/graph/save': function (req: Request, res: Response) {
    const json = {
      memories: req.body,
    };

    fse
      .writeFile(
        './data/graphList.json',
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
