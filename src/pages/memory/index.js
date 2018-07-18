import React from 'react';
import { Card, Tooltip } from 'antd';
import { connect } from 'dva';

import styles from './index.less';

class Memory extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'memory/loadList',
    });
  }

  render() {
    const { list } = this.props;
    console.log('>>>', list);

    return (
      <Card
        title="回忆时刻"
      >
        <ul className={styles.list}>
          {(list || []).map(({ title, description, thumbnail }, index) => {
            const $title = (
              <div className={styles.tooltip}>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            );

            return (
              <li key={index}>
                <Tooltip title={$title}>
                  <img alt={title} src={`/${thumbnail}`} />
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </Card>
    );
  }
}

const mapState = ({ memory: { list } }) => ({
  list,
});

export default connect(mapState)(Memory);