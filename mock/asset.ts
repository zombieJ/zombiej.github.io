import Path from 'path';
import fse from 'fs-extra';
import type { Request, Response } from 'express';

export default {
  'get /data/assets/:file': function (req: Request, res: Response) {
    res.sendFile(Path.resolve(`./data/assets/${req.params.file}`));
  },

  'post /data/assets/upload': function (req: Request, res: Response) {
    const fileName = `${Date.now()}_${req.body.name}`.replace(/\s/g, '');

    const base64Data = req.body.base64.replace(
      /^data:image\/(png|jpg|jpeg);base64,/,
      '',
    );
    fse
      .writeFile(`./data/assets/${fileName}`, base64Data, 'base64')
      .then(() => {
        res.json({ success: true, fileName });
      })
      .catch(() => {
        res.json({ success: false });
      });
  },
};
