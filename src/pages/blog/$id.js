import React from 'react';
import { connect } from 'dva';
import { Tag, Card, Spin, Icon } from 'antd';
import showdown from 'showdown';
import moment from 'moment';

import styles from './$id.less';

const converter = new showdown.Converter();

class Article extends React.Component {
  state = {
    article: null,
    html: '',
  };

  static getDerivedStateFromProps(props, state) {
    const { match: { params: { id } }, articles } = props;
    const article = articles[id];

    const newState = {
      prevProps: props,
    };

    if (article !== state.article) {
      newState.article = article;
    }

    return newState;
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'article/loadArticle',
      id: this.props.match.params.id,
    });

    this.refreshHTML();
  }

  componentDidUpdate() {
    this.refreshHTML();
  }

  refreshHTML = () => {
    const { article } = this.state;
    if (this.article !== article) {
      this.article = article;
      this.setState({
        html: converter.makeHtml(article.content),
      });
    }
  };

  render() {
    const { article, html } = this.state;
    const { dateFormat, isDev } = this.props;
    console.log('>>>', article);

    if (!article) {
      return <Spin />;
    }

    const { title, tags = [], createTime } = article;

    let $extra;
    if (isDev) {
      $extra = (
        <a>
          <Icon type="edit" /> 编辑
        </a>
      );
    }

    return (
      <div>
        <Card title={title} extra={$extra}>
          <div className={styles.prefix}>
            <span className={styles.date}>
              {moment(createTime).format(dateFormat)}
            </span>
            {' | '}
            <span className={styles.tags}>
              {tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </span>
          </div>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />
        </Card>
      </div>
    );
  }
}

const mapState = ({ global: { dateFormat, isDev }, article: { articles } }) => ({
  isDev,
  dateFormat,
  articles,
});

export default connect(mapState)(Article);