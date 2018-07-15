import React from 'react';
import { connect } from 'dva';
import { List, Card, Tag, Select } from 'antd';
import Link from 'umi/link';
import moment from 'moment';

import styles from './index.less';

const Option = Select.Option;

class Blog extends React.Component {
  state = {
    tag: '',
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'article/loadList',
    });
  }

  onTagChange = (tag) => {
    this.setState({ tag });
  };

  render() {
    const { tag } = this.state;
    const { dateFormat, list = [], title } = this.props;

    let allTags = [];
    list.forEach(({ tags }) => {
      allTags = [...allTags, ...tags];
    });
    const tagList = Array.from(new Set(allTags));

    let $extra;
    $extra = (
      <Select size="small" style={{ width: 130 }} value={tag} onChange={this.onTagChange}>
        <Option value="">-- 所有标签 --</Option>
        {tagList.map(tag => (
          <Option key={tag} value={tag}>{tag}</Option>
        ))}
      </Select>
    );

    let filteredList = list;
    if (tag) {
      filteredList = filteredList.filter(({ tags }) => tags.indexOf(tag) !== -1);
    } 

    return (
      <div>
        <Card title={title} extra={$extra}>
          <List
            itemLayout="vertical"
            size="large"
            pagination={{ pageSize: 10 }}
            dataSource={filteredList}
            renderItem={({ createTime, title, introduction, thumbnail, tags }) => (
              <List.Item
                key={createTime}
                extra={
                  thumbnail && <Link to={`/blog/${createTime}`}>
                    <img width={272} alt={title} src={`/${thumbnail}`} />
                  </Link>
                }
              >
                <List.Item.Meta
                  title={
                    <span>
                      <Link to={`/blog/${createTime}`} className={styles.title}>
                        {title}
                      </Link>

                      <span className={styles.tags}>
                        {tags.map(tag => (
                          <Tag key={tag} onClick={() => { this.onTagChange(tag); }}>
                            {tag}
                          </Tag>
                        ))}
                      </span>
                    </span>
                  }
                  description={
                    <span>
                      {moment(createTime).format(dateFormat)}
                    </span>
                  }
                />
                <Link to={`/blog/${createTime}`} className={styles.introduction}>
                  {introduction}
                </Link>
              </List.Item>
            )}
          />
        </Card>
      </div>
    );
  }
}

const mapState = ({ global: { dateFormat, title },article: { list } }) => ({
  dateFormat,
  list,
  title,
});

export default connect(mapState)(Blog);