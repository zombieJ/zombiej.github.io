import React from 'react';
import { connect } from 'dva';
import { Tag, Card, Spin, Icon, Modal } from 'antd';
import showdown from 'showdown';
import moment from 'moment';
import router from 'umi/router';

import { isDev } from '../../../utils/env';

import styles from './index.less';

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

  onEdit = () => {
    const { article } = this.state;

    router.push(`/blog/${article.createTime}/edit`);
  };

  onDelete = () => {
    const { article } = this.state;
    const { dispatch } = this.props;

    Modal.confirm({
      title: 'Are you sure delete this article?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk() {
        dispatch({
          type: 'article/deleteArticle',
          id: article.createTime,
        }).then(() => {
          router.push('/blog');
        });
      },
    });
  };

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
    const { dateFormat, isMobile } = this.props;

    if (!article) {
      return (
        <div
          style={{
            textAlign: 'center',
            marginTop: isMobile ? 16 : null,
          }}
        >
          <Spin />
        </div>
      );
    }

    const { title, tags = [], createTime } = article;

    let $extra;
    if (isDev) {
      $extra = (
        <div>
          <a onClick={this.onEdit}>
            <Icon type="edit" /> 编辑
          </a>
          {' | '}
          <a style={{ color: '#f5222d' }} onClick={this.onDelete}>
            <Icon type="delete" /> 删除
          </a>
        </div>
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

const mapState = ({ global: { dateFormat, isMobile }, article: { articles } }) => ({
  isMobile,
  dateFormat,
  articles,
});

export default connect(mapState)(Article);