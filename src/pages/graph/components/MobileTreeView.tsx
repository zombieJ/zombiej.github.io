import React from 'react';
import classNames from 'classnames';
import { FullscreenOutlined } from '@ant-design/icons';
import { Tree, TreeDataNode, Typography, Modal } from 'antd';
import { Note } from './LinkGraph';
import { parseMarkdown } from './util';
import styles from './LinkGraph.less';

function ComposeTitle(props: { note: Note; onView?: React.MouseEventHandler }) {
  const {
    note: { title, description },
    onView,
  } = props;

  // >>> Content
  const html = React.useMemo(() => parseMarkdown(description), [description]);

  return (
    <div className={classNames(styles.holder, styles.mobile)}>
      {title && (
        <h3 className={styles.title}>
          {title}
          <Typography.Link onClick={onView}>
            <FullscreenOutlined className={styles.fullScreen} />
          </Typography.Link>
        </h3>
      )}
      {(description || '').trim() && (
        <Typography className={styles.content}>
          <div
            className={styles.dangerHolder}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Typography>
      )}
    </div>
  );
}

function renderTitle(treeNode: { note: Note }) {
  return (
    <ComposeTitle
      note={treeNode.note}
      onView={() => {
        Modal.info({
          content: <ComposeTitle note={treeNode.note} />,
          width: '100%',
        });
      }}
    />
  );
}

function toTreeData(data: Note[]) {
  function convert(list?: Note[]): TreeDataNode[] {
    return (list || []).map((note) => {
      return {
        key: note.id,
        note,
        title: renderTitle,
        children: convert(note.children),
      };
    });
  }

  return convert(data);
}

export interface MobileTreeViewProps {
  data: Note[];
}

export default function MobileTreeView(props: MobileTreeViewProps) {
  const { data } = props;

  const treeData = React.useMemo(() => toTreeData(data), [data]);

  return (
    <Tree
      style={{ width: '100%' }}
      treeData={treeData}
      showLine={{ showLeafIcon: false }}
      blockNode
    />
  );
}
