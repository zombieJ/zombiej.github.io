import React from 'react';
import { Card, Tooltip, Button, Icon, Spin } from 'antd';
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
    const { list, isDev, isMobile } = this.props;
    // console.log('>>>', list);

    // Loading status
    if (!list) {
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

    let $extra;
    if (isDev) {
      $extra = (
        <div>
          <Button size="small" type="primary" onClick={this.onCreateMemory}>
            <Icon type="cloud-o" />创建回忆
          </Button>
        </div>
      );
    }

    return (
      <div>
        <Card
          title="回忆时刻"
          extra={$extra}
        >
          <ul className={styles.list}>
            {(list || []).map(({ title, description, thumbnail }, index) => {
              const $title = (
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              );

              return (
                <Tooltip key={index} title={$title} overlayClassName={styles.tooltip}>
                  <li>
                    <img alt={title} src={`/${thumbnail}`} />
                    {isDev &&
                      <ul className={styles.operations}>
                        <li role="button" className={styles.delete}>
                          <Icon type="delete" />
                        </li>
                        <li role="button">
                          <Icon type="caret-left" />
                        </li>
                        <li role="button">
                          <Icon type="caret-right" />
                        </li>
                      </ul>
                    }
                  </li>
                </Tooltip>
              );
            })}
          </ul>
        </Card>

        <MemoryEdit setRef={this.setMemoryRef} />
      </div>
    );
  }
}

const mapState = ({ global: { isDev, isMobile }, memory: { list } }) => ({
  isDev,
  isMobile,
  list,
});

export default connect(mapState)(Memory);