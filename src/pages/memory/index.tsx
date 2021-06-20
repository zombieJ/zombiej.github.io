import React from 'react';
import { Card, Tooltip, Button, Modal } from 'antd';
import {
  CloudOutlined,
  DeleteOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import useSwr, { mutate } from 'swr';

import styles from './index.less';
import FullSpin from '@/components/FullSpin';
import RootContext from '@/context';
import MemoryEdit, { MemoryEditRef } from './components/Edit';

export interface Memory {
  thumbnail: string;
  title: string;
  description: string;
}

const MemImg = ({
  memory,
  onClick,
}: {
  onClick?: (memory: Memory) => void;
  memory: Memory;
}) => {
  const props: React.HTMLAttributes<HTMLImageElement> = {};
  if (onClick) {
    props.onClick = () => {
      onClick(memory);
    };
    props.role = 'button';
    props.tabIndex = -1;
  }

  return <img alt={memory.title} src={`/${memory.thumbnail}`} {...props} />;
  // }
};

export default () => {
  const { mobile } = React.useContext(RootContext);
  const { data: list } = useSwr<{ memories: Memory[] }>(
    '/data/memoryList.json',
  );
  const memoryRef = React.useRef<MemoryEditRef>(null);

  // ========================== View ==========================
  const onMemoryClick = ({ title, description }: Memory) => {
    Modal.info({
      title,
      content: description,
      maskClosable: true,
    });
  };

  // ========================== Edit ==========================
  let onCreateMemory: undefined | (() => void) = undefined;
  let onDeleteMemory: undefined | ((memory: Memory) => void) = undefined;
  let moveOffset: undefined | ((memory: Memory, offset: number) => void) =
    undefined;

  // 线上环境不需要
  if (process.env.NODE_ENV === 'development') {
    const updateList = (memories?: Memory[]) => {
      if (!memories) {
        return;
      }

      fetch('/data/memories/save', {
        method: 'POST',
        body: JSON.stringify(memories),
        headers: {
          'content-type': 'application/json',
        },
      }).then(() => {
        mutate('/data/memoryList.json');
      });
    };

    onCreateMemory = () => {
      memoryRef.current?.createMemory();
    };

    onDeleteMemory = (memory) => {
      Modal.confirm({
        title: '删除这段记忆吗？',
        okType: 'danger',
        onOk: () => {
          updateList(list?.memories.filter((mem) => mem !== memory));
        },
      });
    };

    moveOffset = (memory, offset) => {
      const newList = [...(list?.memories || [])];
      const index = newList.indexOf(memory);
      const targetIndex = index + offset;
      const target = newList[targetIndex];

      if (target) {
        newList[index] = target;
        newList[targetIndex] = memory;

        updateList(newList);
      }
    };
  }

  // ========================= Render =========================
  if (!list) {
    return <FullSpin />;
  }

  let $extra;
  if (process.env.NODE_ENV === 'development') {
    $extra = (
      <div>
        <Button size="small" type="primary" onClick={onCreateMemory}>
          <CloudOutlined />
          创建回忆
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card title="朝花夕拾" extra={$extra}>
        <ul className={styles.list}>
          {(list.memories || []).map((memory, index) => {
            const { title, description } = memory;
            const $title = (
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            );

            const $li = (
              <li key={index}>
                <MemImg
                  onClick={mobile ? onMemoryClick : undefined}
                  memory={memory}
                />
                {process.env.NODE_ENV === 'development' && !mobile && (
                  <ul className={styles.operations}>
                    <li
                      role="button"
                      className={styles.delete}
                      onClick={() => {
                        onDeleteMemory?.(memory);
                      }}
                    >
                      <DeleteOutlined />
                    </li>
                    <li
                      role="button"
                      onClick={() => {
                        moveOffset?.(memory, -1);
                      }}
                    >
                      <CaretLeftOutlined />
                    </li>
                    <li
                      role="button"
                      onClick={() => {
                        moveOffset?.(memory, 1);
                      }}
                    >
                      <CaretRightOutlined />
                    </li>
                  </ul>
                )}
              </li>
            );

            return mobile ? (
              $li
            ) : (
              <Tooltip
                key={index}
                title={$title}
                overlayClassName={styles.tooltip}
              >
                {$li}
              </Tooltip>
            );
          })}
        </ul>
      </Card>

      {process.env.NODE_ENV === 'development' && (
        <MemoryEdit list={list.memories} ref={memoryRef} />
      )}
    </div>
  );
};

// // 线上也不需要这个组件
// const MemoryEdit =
//   process.env.NODE_ENV === 'development'
//     ? require('./components/Edit').default
//     : null;

// class Memory extends React.Component {
//   constructor() {
//     super();

//   }

//   componentDidMount() {
//     this.props.dispatch({
//       type: 'memory/loadList',
//     });
//   }

//   render() {
//     const { list, isMobile } = this.props;
//   }
// }

// const mapState = ({ global: { isMobile }, memory: { list } }) => ({
//   isMobile,
//   list,
// });

// export default connect(mapState)(Memory);
