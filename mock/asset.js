import Path from 'path';
import fse from 'fs-extra';

export default {
  'get /data/assets/:file': function(req, res) {
    res.sendFile(Path.resolve(`./data/assets/${req.params.file}`));
  },

  'post /data/assets/upload': function(req, res) {
    const fileName = `${Date.now()}_${req.body.name}`;

    const base64Data = req.body.base64.replace(/^data:image\/png;base64,/, '');
    fse
      .writeFile(`./data/assets/${fileName}`, base64Data, 'base64')
      .then(() => {
        res.json({ success: true, fileName });
      })
      .catch(() => {
        res.json({ success: false });
      });
    
  }
};