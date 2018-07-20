import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import NewBlog from '../new';

class Edit extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'article/loadArticle',
      id: this.props.match.params.id,
    });
  }

  render() {
    const { articles, match: { params } } = this.props;
    const article = articles[params.id];

    if (!article) {
      return <Spin />;
    }

    return (
      <NewBlog article={article} {...this.props} />
    );
  }
}

const mapState = ({ article: { articles } }) => ({
  articles,
});

export default connect(mapState)(Edit);