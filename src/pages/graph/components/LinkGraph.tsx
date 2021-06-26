import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import { Modal, Form, Input } from 'antd';
import classNames from 'classnames';
import styles from './LinkGraph.less';

const NOTE_WIDTH = 200;

const LinkGraphContext = React.createContext<{
  editable?: boolean;
  onEdit: (note: Note) => void;
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

interface NoteBlockProps {
  note: Note;
  active?: boolean;
  onClick: React.MouseEventHandler;
}

function NoteBlock({ note, active, onClick }: NoteBlockProps) {
  const { editable, onEdit } = React.useContext(LinkGraphContext);

  return (
    <div
      className={classNames(styles.noteBlock, {
        [styles.active]: active,
      })}
      onClick={onClick}
      onDoubleClick={() => {
        onEdit(note);
      }}
    >
      <div className={styles.content}>
        <h3>{note.title}</h3>
        <p>{note.description}</p>
      </div>
      {!!note.children?.length && (
        <div className={styles.hasChildren}>
          <RightOutlined />
        </div>
      )}
    </div>
  );
}

interface NoteBlockListProps {
  notes: Note[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function NoteBlockList({ notes, activeIndex, onSelect }: NoteBlockListProps) {
  if (!notes.length) {
    return null;
  }

  return (
    <div className={styles.noteBlockList} style={{ width: NOTE_WIDTH }}>
      {notes.map((note, index) => (
        <NoteBlock
          key={index}
          note={note}
          active={index === activeIndex}
          onClick={() => {
            onSelect(index);
          }}
        />
      ))}
    </div>
  );
}

export interface LinkGraphProps {
  editable?: boolean;
  notes?: Note[];
}

export default function LinkGraph({
  editable,
  notes = testNodes,
}: LinkGraphProps) {
  const [editNote, setEditNote] = React.useState<Note | null>(null);

  const descRef = React.useRef<any>(null);

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
    let currentList = notes;
    const internalList: Note[][] = [notes];

    for (let i = 0; i < path.length; i += 1) {
      currentList = currentList[path[i]]?.children || [];
      internalList.push(currentList);
    }

    return internalList;
  }, [path, notes]);

  // ============================ Edit ============================
  const onEdit = (note: Note) => {
    setEditNote(note);
  };

  const onUpdate = () => {
    const values = form.getFieldsValue();
    Object.keys(values).forEach((key) => {
      const value = values[key];
      (editNote as any)[key] = value;
    });

    setEditNote(null);
    setInternalNotes((notes) => [...notes]);
  };

  React.useEffect(() => {
    if (editNote) {
      form.setFieldsValue(editNote);

      setTimeout(() => {
        descRef.current?.focus();
      }, 50);
    }
  }, [!!editNote]);

  // =========================== Render ===========================
  return (
    <LinkGraphContext.Provider value={{ editable, onEdit }}>
      <div style={{ display: 'flex', alignItems: 'start' }}>
        {notesList.map((noteList, noteIndex) => (
          <NoteBlockList
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
        visible={!!editNote}
        onCancel={() => {
          setEditNote(null);
        }}
        onOk={onUpdate}
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item name="title" label="标题">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea autoSize={{ minRows: 6 }} ref={descRef} />
          </Form.Item>
        </Form>
      </Modal>
    </LinkGraphContext.Provider>
  );
}
