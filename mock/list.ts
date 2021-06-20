import fse from 'fs-extra';
import type { Request, Response } from 'express';

export default {
  'get /data/list.json': function (_: Request, res: Response) {
    fse
      .readJson('./data/list.json')
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
};
