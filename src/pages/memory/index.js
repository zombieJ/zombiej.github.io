import React from 'react';
import { Card, Tooltip, Button, Icon, Spin, Modal } from 'antd';
import { connect } from 'dva';

import styles from './index.less';

// 线上也不需要这个组件
const MemoryEdit = process.env.NODE_ENV === 'development' ?
  require('./components/Edit').default : null;

class Memory extends React.Component {
  constructor() {
    super();

    // 线上环境不需要
    if (process.env.NODE_ENV === 'development') {
      this.onCreateMemory = () => {
        this.$memory.createMemory();
      };
    
      this.onDeleteMemory = (memory) => {
        Modal.confirm({
          title: '删除这段记忆吗？',
          okType: 'danger',
          onOk: () => {
            const { list, dispatch } = this.props;
            dispatch({
              type: 'memory/saveMemories',
              list: list.filter(mem => mem !== memory),
            }).then(() => {
              dispatch({
                type: 'memory/loadList',
              })
            });
          },
        });
      };
    
      this.setMemoryRef = (ele) => {
        this.$memory = ele;
      };
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'memory/loadList',
    });
  }

  render() {
    const { list, isMobile } = this.props;

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
    if (process.env.NODE_ENV === 'development') {
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
            {(list || []).map((memory, index) => {
              const { title, description, thumbnail } = memory;
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
                    {process.env.NODE_ENV === 'development' &&
                      <ul className={styles.operations}>
                        <li role="button" className={styles.delete} onClick={() => { this.onDeleteMemory(memory); }}>
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

        {process.env.NODE_ENV === 'development' &&
          <MemoryEdit setRef={this.setMemoryRef} />
        }
      </div>
    );
  }
}

const mapState = ({ global: { isMobile }, memory: { list } }) => ({
  isMobile,
  list,
});

export default connect(mapState)(Memory);