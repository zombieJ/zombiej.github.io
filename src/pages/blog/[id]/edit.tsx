import React from 'react';
import useSwr from 'swr';
import FullSpin from '@/components/FullSpin';
import NewBlog from '../new';
import { Article } from '.';

// class Edit extends React.Component {
//   componentDidMount() {
//     this.props.dispatch({
//       type: 'article/loadArticle',
//       id: this.props.match.params.id,
//     });
//   }

//   render() {
//     const { articles, match: { params } } = this.props;
//     const article = articles[params.id];

//     if (!article) {
//       return <Spin />;
//     }

//     return (
//       <NewBlog article={article} {...this.props} />
//     );
//   }
// }

// const mapState = ({ article: { articles } }) => ({
//   articles,
// });

// export default connect(mapState)(Edit);

export default function Edit(props: { match: { params: { id: string } } }) {
  const {
    match: {
      params: { id },
    },
  } = props;

  const { data: article } = useSwr<Article>(`/data/articles/${id}.json`);

  if (!article) {
    return <FullSpin />;
  }

  return <NewBlog article={article} />;
}
