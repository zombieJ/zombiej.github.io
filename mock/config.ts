import fse from 'fs-extra';
import type { Request, Response } from 'express';

export default {
  'get /data/config.json': function (_: Request, res: Response) {
    fse
      .readJson('./data/config.json')
      .then((json) => {
        res.json(json);
      })
      .catch((err) => {
        console.error(err);
        res.json(err);
      });
  },

  'post /data/config/save': function (req: Request, res: Response) {
    fse
      .writeFile(
        './data/config.json',
        JSON.stringify(req.body, null, '\t'),
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
