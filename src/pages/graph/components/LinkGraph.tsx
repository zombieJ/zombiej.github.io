import React from 'react';
import marked from 'marked';
import { RightOutlined, PlusOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Typography } from 'antd';
import classNames from 'classnames';
import { get, set } from 'lodash';
import styles from './LinkGraph.less';

const NOTE_WIDTH = 200;

const EMPTY_LIST: Note[] = [];

const LinkGraphContext = React.createContext<{
  editable?: boolean;
  onEdit: (path: number[]) => void;
}>(null as any);

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
  note: Note;
  active?: boolean;
  onSelect?: React.MouseEventHandler;
  path: number[];
}

function NoteBlock({ note, active, path, onSelect }: NoteBlockProps) {
  const { editable, onEdit } = React.useContext(LinkGraphContext);

  // >>> Content
  const html = React.useMemo(
    () => marked(note.description || ''),
    [note.description],
  );

  // >>> Edit
  const onInternalEdit = (editPath: number[]) => {
    if (!editable) return;

    onEdit(editPath);
  };

  // >>> Render
  let extraNode: React.ReactNode;
  if (note.children?.length) {
    extraNode = (
      <div className={styles.hasChildren}>
        <RightOutlined />
      </div>
    );
  } else if (onSelect) {
    extraNode = (
      <div
        className={styles.hasChildren}
        onClick={() => {
          onEdit([...path, 0]);
        }}
      >
        <PlusOutlined />
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.noteBlock, {
        [styles.active]: active,
      })}
      onClick={onSelect}
      onDoubleClick={() => {
        onInternalEdit(path);
      }}
    >
      <div className={styles.content}>
        <h3>{note.title ?? '无标题'}</h3>
        <Typography>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </Typography>
      </div>
      {extraNode}
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

  if (!notes.length) {
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
          path={[...path, notes.length]}
          note={{
            title: '新建',
          }}
        />
      )}
    </div>
  );
}

export interface LinkGraphProps {
  editable?: boolean;
  notes?: Note[];
}

export default function LinkGraph({
  editable,
  notes = EMPTY_LIST,
}: LinkGraphProps) {
  // const [editNote, setEditNote] = React.useState<Note | null>(null);
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
    setPath(newPath);
  };

  // ============================ Note ============================
  const [internalNotes, setInternalNotes] = React.useState(notes);

  React.useEffect(() => {
    setInternalNotes(notes);
  }, [notes]);

  const notesList = React.useMemo(() => {
    let currentList = internalNotes?.length ? internalNotes : [{}];
    const internalList: Note[][] = [currentList];

    for (let i = 0; i < path.length; i += 1) {
      currentList = currentList[path[i]]?.children || [];
      internalList.push(currentList);
    }

    return internalList;
  }, [path, internalNotes]);

  // ============================ Edit ============================
  const onEdit = (path: number[]) => {
    const connectPath: (string | number)[] = [];

    path.forEach((noteIndex, index) => {
      if (index !== 0) {
        connectPath.push('children');
      }
      connectPath.push(noteIndex);
    });

    setEditNotePath(connectPath);
  };

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

  React.useEffect(() => {
    if (editNotePath) {
      form.resetFields();
      form.setFieldsValue(get(internalNotes, editNotePath));

      setTimeout(() => {
        titleRef.current?.focus();
      }, 50);
    }
  }, [!!editNotePath]);

  // =========================== Render ===========================
  return (
    <LinkGraphContext.Provider value={{ editable, onEdit }}>
      <div style={{ display: 'flex', alignItems: 'start', columnGap: 8 }}>
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
        <Form form={form} layout="vertical" autoComplete="off">
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
