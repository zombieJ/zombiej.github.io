import React from 'react';
import marked from 'marked';
import { RightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Typography, Button } from 'antd';
import classNames from 'classnames';
import { get, set } from 'lodash';
import styles from './LinkGraph.less';

const NOTE_WIDTH = 200;

const EMPTY_LIST: Note[] = [];

const LinkGraphContext = React.createContext<{
  editable?: boolean;
  onEdit: (path: number[]) => void;
  onRemove: (path: number[]) => void;
}>(null as any);

function getConnectedPath(path: number[]) {
  const connectPath: (string | number)[] = [];

  path.forEach((noteIndex, index) => {
    if (index !== 0) {
      connectPath.push('children');
    }
    connectPath.push(noteIndex);
  });

  return connectPath;
}

export interface Note {
  title?: string;
  description?: string;
  children?: Note[];
}

const testNodes: Note[] = [
  {
    title: 'title',
    description: 'desc',
    children: [
      {
        title: 'title',
        description: 'desc',
        children: [
          {
            title: 'title',
            description: 'desc',
            children: [],
          },
        ],
      },
      {
        title: 'title',
        description: 'desc',
        children: [],
      },
    ],
  },
  {
    title: 'title',
    description: 'desc',
    children: [],
  },
];

// =============================================================================
// =                                   数据块                                   =
// =============================================================================
interface NoteBlockProps {
  create?: boolean;
  note: Note;
  active?: boolean;
  onSelect?: () => void;
  path: number[];
}

function NoteBlock({ create, note, active, path, onSelect }: NoteBlockProps) {
  const { editable, onEdit, onRemove } = React.useContext(LinkGraphContext);

  // >>> Content
  const html = React.useMemo(
    () => marked(note.description || ''),
    [note.description],
  );

  // >>> Select
  const onInternalSelect = () => {
    if (onSelect) {
      onSelect();
    } else if (create) {
      onInternalEdit(path);
    }
  };

  // >>> Edit
  const onInternalEdit = (editPath: number[]) => {
    if (!editable) return;

    onEdit(editPath);
  };

  // ======================== Render ========================
  // >>> has children
  let extraChildrenNode: React.ReactNode;
  if (note.children?.length) {
    extraChildrenNode = (
      <div className={styles.extra}>
        <RightOutlined />
      </div>
    );
  }

  // >>> remove
  const extraRemoveNode = onSelect && editable && (
    <div
      className={classNames(styles.extra, styles.hover)}
      onClick={(e) => {
        e.stopPropagation();
        onRemove(path);
      }}
    >
      <DeleteOutlined />
    </div>
  );

  return (
    <div
      className={classNames(styles.noteBlock, {
        [styles.active]: active,
        [styles.create]: create,
      })}
      onClick={onInternalSelect}
      onDoubleClick={() => {
        onInternalEdit(path);
      }}
    >
      <div className={styles.holder}>
        {!note.title && !html && '无标题'}
        <h3>{note.title}</h3>
        <Typography className={styles.content}>
          <div
            className={styles.dangerHolder}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Typography>
      </div>
      {extraRemoveNode}
      {extraChildrenNode}
    </div>
  );
}

// =============================================================================
// =                                  数据列表                                  =
// =============================================================================
interface NoteBlockListProps {
  path: number[];
  notes: Note[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function NoteBlockList({
  notes,
  activeIndex,
  path,
  onSelect,
}: NoteBlockListProps) {
  const { editable } = React.useContext(LinkGraphContext);

  if (!notes.length && !editable) {
    return null;
  }

  return (
    <div className={styles.noteBlockList} style={{ width: NOTE_WIDTH }}>
      {notes.map((note, index) => (
        <NoteBlock
          path={[...path, index]}
          key={index}
          note={note}
          active={index === activeIndex}
          onSelect={() => {
            onSelect(index);
          }}
        />
      ))}
      {editable && (
        <NoteBlock
          create
          path={[...path, notes.length]}
          note={{
            description: '\\+ 新建',
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// =                                  图形本体                                  =
// =============================================================================
export interface LinkGraphProps {
  editable?: boolean;
  notes?: Note[];
  onSave?: (notes: Note[]) => void;
}

export default function LinkGraph({
  editable,
  notes = EMPTY_LIST,
}: LinkGraphProps) {
  const [editNotePath, setEditNotePath] = React.useState<
    (number | string)[] | null
  >(null);

  const titleRef = React.useRef<any>(null);

  const [form] = Form.useForm();

  // ============================ Path ============================
  const [path, setPath] = React.useState<number[]>([]);

  const onUpdatePath = (pathIndex: number, index: number) => {
    const newPath = path.slice(0, pathIndex);
    newPath[pathIndex] = index;

    if (newPath.join('_') === path.join('_')) {
      setPath([]);
    } else {
      setPath(newPath);
    }
  };

  // ============================ Note ============================
  const [internalNotes, setInternalNotes] = React.useState(notes);

  React.useEffect(() => {
    setInternalNotes(notes);
  }, [notes]);

  const notesList = React.useMemo(() => {
    let currentList = internalNotes?.length ? internalNotes : [];
    const internalList: Note[][] = [currentList];

    for (let i = 0; i < path.length; i += 1) {
      currentList = currentList[path[i]]?.children || [];
      internalList.push(currentList);
    }

    return internalList;
  }, [path, internalNotes]);

  // ============================ Edit ============================
  const onEdit = (path: number[]) => {
    setEditNotePath(getConnectedPath(path));
  };

  const onRemove = (path: number[]) => {
    const fullPath = getConnectedPath(path);
    const note = get(internalNotes, fullPath);

    Modal.confirm({
      title: '确认',
      content: `确认删除 ${note.title || '该内容'} 吗？`,
      onOk: () => {
        let clone: Note[] = JSON.parse(JSON.stringify(internalNotes));
        set(clone, fullPath, null);

        const parentPath = getConnectedPath(path.slice(0, -1));
        const note: Note = get(clone, parentPath);
        if (note) {
          note.children = note.children?.filter((n) => n);
        } else {
          clone = clone.filter((n) => n);
        }

        setInternalNotes(clone);
        setPath(path.slice(0, -1));
      },
    });
  };

  React.useEffect(() => {
    if (editNotePath) {
      form.resetFields();
      form.setFieldsValue(get(internalNotes, editNotePath));

      setTimeout(() => {
        titleRef.current?.focus();
      }, 50);
    }
  }, [!!editNotePath]);

  // =========================== Submit ===========================
  const onUpdate = () => {
    const clone = JSON.parse(JSON.stringify(internalNotes));

    const values = form.getFieldsValue();
    Object.keys(values).forEach((key) => {
      const value = values[key];
      set(clone, [...editNotePath!, key], value);
    });

    setEditNotePath(null);
    setInternalNotes(clone);
  };

  const onSubmitKey: React.KeyboardEventHandler = (e) => {
    if (e.which === 13 && (e.metaKey || e.ctrlKey)) {
      onUpdate();
    }
  };

  // =========================== Render ===========================
  return (
    <LinkGraphContext.Provider value={{ editable, onEdit, onRemove }}>
      {editable && (
        <div style={{ position: 'sticky', top: 0, marginBottom: 24 }}>
          <Button type="primary">保存</Button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'start',
          columnGap: 8,
          position: 'relative',
        }}
      >
        {/* 操作栏 */}

        {notesList.map((noteList, noteIndex) => (
          <NoteBlockList
            path={path.slice(0, noteIndex)}
            key={noteIndex}
            notes={noteList}
            activeIndex={path[noteIndex]}
            onSelect={(index) => {
              onUpdatePath(noteIndex, index);
            }}
          />
        ))}
      </div>

      {/* 编辑框 */}
      <Modal
        visible={!!editNotePath}
        onCancel={() => {
          setEditNotePath(null);
        }}
        onOk={onUpdate}
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onKeyDown={onSubmitKey}
        >
          <Form.Item name="title" label="标题">
            <Input ref={titleRef} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea autoSize={{ minRows: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </LinkGraphContext.Provider>
  );
}
