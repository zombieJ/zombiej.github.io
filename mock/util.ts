import fse from 'fs-extra';
import marked from 'marked';
import jquery from 'jquery';
import { JSDOM } from 'jsdom';

const MAX_LENGTH = 150;

const { window } = new JSDOM('<html></html>');
var $ = jquery(window) as any;

export function refreshList(type: 'articles' | 'graphs' = 'articles') {
  const originContent = fse.readJsonSync('./data/list.json');

  // 本地运行，直接 Sync 了
  const fileList = fse.readdirSync(`./data/${type}`);

  const data = fileList
    .map((fileName) => {
      const { title, tags, content, createTime, thumbnail, hide } =
        fse.readJsonSync(`./data/${type}/${fileName}`);

      let introduction: string | undefined = undefined;

      if (type === 'articles') {
        const html = marked(content);
        const $div = $('<div>').html(html);

        const text = $div.text().trim();
        introduction =
          text.slice(0, MAX_LENGTH) + (text.length > MAX_LENGTH ? '……' : '');
      }

      return {
        title,
        hide,
        introduction,
        tags,
        thumbnail,
        createTime,
      };
    })
    .sort((a, b) => b.createTime - a.createTime);

  const wrapper = {
    ...originContent,
    [`${type}`]: data,
  };

  return fse
    .writeFile('./data/list.json', JSON.stringify(wrapper, null, '\t'), 'utf8')
    .then(() => wrapper);
}
