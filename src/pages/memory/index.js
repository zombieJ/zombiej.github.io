import React from 'react';
import { Card, Tooltip, Button, Icon } from 'antd';
import { connect } from 'dva';

import MemoryEdit from './components/Edit';
import styles from './index.less';

class Memory extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'memory/loadList',
    });
  }

  onCreateMemory = () => {
    this.$memory.createMemory();
  };

  setMemoryRef = (ele) => {
    this.$memory = ele;
  };

  render() {
    const { list } = this.props;
    // console.log('>>>', list);

    const $extra = (
      <div>
        <Button size="small" type="primary" onClick={this.onCreateMemory}>
          <Icon type="cloud-o" />创建回忆
        </Button>
      </div>
    );

    return (
      <div>
        <Card
          title="回忆时刻"
          extra={$extra}
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

        <MemoryEdit setRef={this.setMemoryRef} />
      </div>
    );
  }
}

const mapState = ({ memory: { list } }) => ({
  list,
});

export default connect(mapState)(Memory);