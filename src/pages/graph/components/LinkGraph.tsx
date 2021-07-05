import React from 'react';
import {
  RightOutlined,
  DeleteOutlined,
  SyncOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import produce from 'immer';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Modal,
  Form,
  Input,
  Typography,
  Button,
  Switch,
  Space,
  Breadcrumb,
} from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import isMobile from 'rc-util/es/isMobile';
import RootContext from '@/context';
import { get, set } from 'lodash';
import styles from './LinkGraph.less';
import { parseMarkdown } from './util';

const NOTE_MIN_WIDTH = 200;
const NOTE_MAX_WIDTH = 400;

const EMPTY_LIST: Note[] = [];

const mobile = isMobile();

const LinkGraphContext = React.createContext<{
  editable?: boolean;
  onEdit: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  moveRecord: (dragPath: number[], hoverPath: number[]) => void;
}>(null as any);

function getConnectedPath(path: number[], virtualRootNote = false) {
  const connectPath: (string | number)[] = [];

  path.forEach((noteIndex, index) => {
    if (index !== 0) {
      connectPath.push('children');
    }
    connectPath.push(noteIndex);
  });

  if (virtualRootNote) {
    if (path.length) {
      connectPath.unshift('children');
    }
    connectPath.push('children');
  }

  return connectPath;
}

export interface Note {
  id: string;
  title?: string;
  description?: string;
  children?: Note[];
}

// =============================================================================
// =                                   数据块                                   =
// =============================================================================
interface NoteBlockProps {
  note: Note;
  active?: boolean;
  onSelect?: () => void;
  path: number[];
}

interface BasicNoteBlockProps extends NoteBlockProps {
  id: string;
  index: number;
}
interface CreateNoteBlockProps extends NoteBlockProps {
  create: true;
}

const ItemTypes = {
  CARD: 'card',
};

interface DragItem {
  index: number;
  id: string;
  path: number[];
  type: string;
}

function NoteBlock(props: BasicNoteBlockProps | CreateNoteBlockProps) {
  const { create, note, active, path, onSelect, id, index } =
    props as BasicNoteBlockProps & CreateNoteBlockProps;

  const { editable, onEdit, onRemove, moveRecord } =
    React.useContext(LinkGraphContext);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // ===================== Drag & Drop ======================
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop(item: DragItem, monitor: DropTargetMonitor) {
      if (!containerRef.current) {
        return;
      }
      const dragPath = item.path;
      const hoverPath = path;

      // Don't replace items with themselves
      const dragPathStr = [...dragPath, ''].join('_');
      const hoverPathStr = [...hoverPath, ''].join('_');
      if (dragPathStr === hoverPathStr) {
        return;
      }

      // Not allow nest
      if (hoverPathStr.startsWith(dragPathStr)) {
        return;
      }

      // Time to actually perform the action
      moveRecord(dragPath, hoverPath);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.path = hoverPath;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index, path };
    },
    collect: (monitor: any) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  const opacity = isDragging ? 0.5 : 1;

  if (!create) {
    drag(drop(containerRef));
  }

  // ======================== Handle ========================
  // >>> Content
  const html = React.useMemo(
    () => parseMarkdown(note.description),
    [note.description],
  );

  // >>> Select
  const selectRef = React.useRef<NodeJS.Timeout>();

  const onInternalSelect = () => {
    if (onSelect && (editable || note.children?.length)) {
      clearTimeout(selectRef.current!);
      selectRef.current = setTimeout(onSelect, !active ? 0 : 200);
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
      ref={containerRef}
      className={classNames(styles.noteBlock, {
        [styles.active]: active,
        [styles.create]: create,
      })}
      style={{ opacity }}
      onClick={onInternalSelect}
      onDoubleClick={() => {
        clearTimeout(selectRef.current!);
        onInternalEdit(path);
      }}
    >
      <div className={styles.holder}>
        {!note.title && !html && '无标题'}
        {note.title && <h3>{note.title}</h3>}
        {(note.description || '').trim() && (
          <Typography className={styles.content}>
            <div
              className={styles.dangerHolder}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </Typography>
        )}
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
  style?: React.CSSProperties;
  path: number[];
  notes: Note[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function NoteBlockList({
  style,
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
    <div
      className={styles.noteBlockList}
      style={{
        minWidth: NOTE_MIN_WIDTH,
        maxWidth: mobile ? 'auto' : NOTE_MAX_WIDTH,
        ...style,
      }}
    >
      {notes.map((note, index) => {
        return (
          <NoteBlock
            id={note.id}
            index={index}
            path={[...path, index]}
            key={note.id}
            note={note}
            active={index === activeIndex}
            onSelect={() => {
              onSelect(index);
            }}
          />
        );
      })}
      {editable && (
        <NoteBlock
          create
          path={[...path, notes.length]}
          note={{
            id: 'create',
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
export interface LinkGraphInfo {
  title: string;
  content: Note[];
}

export interface LinkGraphProps {
  editable?: boolean;
  createTime?: number;
  notes?: Note[];
  onSave?: (info: LinkGraphInfo) => void;
  onDelete?: () => void;
  refreshing?: boolean;
  title?: string;
}

export default function LinkGraph({
  title,
  editable,
  createTime,
  notes = EMPTY_LIST,
  onSave,
  onDelete,
  refreshing,
}: LinkGraphProps) {
  const { dateFormat } = React.useContext(RootContext);
  const [readOnly, setReadOnly] = React.useState(false);
  const mergedEditable = editable && !readOnly && !mobile;

  const [editNotePath, setEditNotePath] = React.useState<
    (number | string)[] | null
  >(null);

  const titleRef = React.useRef<any>(null);

  const [form] = Form.useForm();
  const [rootForm] = Form.useForm();

  // ============================ Path ============================
  const [path, setPath] = React.useState<number[]>([]);

  const onUpdatePath = (pathIndex: number, index: number) => {
    const parentPath = path.slice(0, pathIndex);
    const newPath = [...parentPath];
    newPath[pathIndex] = index;

    if (newPath.join('_') === path.join('_')) {
      setPath(parentPath);
    } else {
      setPath(newPath);
    }
  };

  // ============================ Note ============================
  const filledNotes: Note[] = React.useMemo(() => {
    const rootNote = produce({ children: notes } as Note, (draftRootNode) => {
      function fillId(note: Note) {
        if (!note.id) {
          note.id = `${Date.now()}${Math.random().toFixed(10)}`.replace(
            '0.',
            '',
          );
        }

        note.children?.forEach(fillId);
      }

      fillId(draftRootNode);
    });

    return rootNote.children!;
  }, [notes]);

  const [internalNotes, setInternalNotes] = React.useState(filledNotes);

  React.useEffect(() => {
    setInternalNotes(filledNotes);
  }, [filledNotes]);

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
        const rootNote = produce(
          {
            children: internalNotes,
          },
          (draftRootNote) => {
            const parentPath = getConnectedPath(path.slice(0, -1), true);
            const parentNoteChildren: Note[] = get(draftRootNote, parentPath);
            const noteIndex = parentNoteChildren.findIndex(
              (n) => n.id === note.id,
            );

            if (noteIndex >= 0) {
              parentNoteChildren.splice(noteIndex, 1);
            }
          },
        );

        setInternalNotes(rootNote.children);
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

  // ============================ Drag ============================
  const moveRecord = React.useCallback(
    (dragPath: number[], hoverPath: number[]) => {
      const fakeRootNote: Note = { id: 'root', children: internalNotes };
      const rootNote = produce(fakeRootNote, (draftRootNote) => {
        // Drag
        const parentDragPath = getConnectedPath(dragPath.slice(0, -1), true);
        const parentDragNoteChildren: Note[] = get(
          draftRootNote,
          parentDragPath,
        );

        // Hover
        const parentHoverPath = getConnectedPath(hoverPath.slice(0, -1), true);
        const parentHoverNoteChildren: Note[] = get(
          draftRootNote,
          parentHoverPath,
        );

        const [dragRecord] = parentDragNoteChildren.splice(
          dragPath[dragPath.length - 1],
          1,
        );

        parentHoverNoteChildren.splice(
          hoverPath[hoverPath.length - 1],
          0,
          dragRecord,
        );
      });

      setInternalNotes(rootNote.children!);

      // Back of origin path
      let current = fakeRootNote;
      const pathKeys: string[] = [];
      path.forEach((pathIndex) => {
        current = current.children?.[pathIndex]!;
        pathKeys.push(current.id);
      });

      current = rootNote;
      const newPath: number[] = [];
      pathKeys.forEach((pathKey) => {
        const currentIndex =
          current.children?.findIndex((n) => n.id === pathKey) ?? -1;
        if (currentIndex >= 0) {
          newPath.push(currentIndex);
          current = current.children?.[currentIndex]!;
        }
      });
      setPath(newPath);
    },
    [internalNotes, path],
  );

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
  // >>>>> 笔记列表
  let notesNode: React.ReactNode;
  if (!mobile) {
    notesNode = notesList.map((noteList, noteIndex) => (
      <NoteBlockList
        style={{
          flex: noteIndex === notesList.length - 1 ? 'none' : '0 1 auto',
        }}
        path={path.slice(0, noteIndex)}
        key={noteIndex}
        notes={noteList}
        activeIndex={path[noteIndex]}
        onSelect={(index) => {
          onUpdatePath(noteIndex, index);
        }}
      />
    ));
  } else {
    const lastIndex = notesList.length - 1;
    notesNode = (
      <NoteBlockList
        style={{
          flex: 'auto',
          marginRight: 16,
        }}
        path={path}
        notes={notesList[lastIndex]}
        activeIndex={path[lastIndex]}
        onSelect={(index) => {
          onUpdatePath(lastIndex, index);
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        left: 16,
        right: 0,
        top: 0,
        bottom: 0,
        paddingTop: 16,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <LinkGraphContext.Provider
          value={{ editable: mergedEditable, onEdit, onRemove, moveRecord }}
        >
          {/* PC 操作栏 */}
          {!mobile && (
            <div style={{ marginBottom: 16, height: 32, flex: 'none' }}>
              <Form
                form={rootForm}
                component={false}
                layout="inline"
                autoComplete="off"
              >
                <Space size="large">
                  {editable ? (
                    <Form.Item
                      initialValue={title}
                      label="标题"
                      name="title"
                      style={{ margin: 0 }}
                    >
                      <Input autoComplete="off" />
                    </Form.Item>
                  ) : (
                    title
                  )}

                  {createTime && moment(createTime).format(dateFormat)}

                  {editable && (
                    <Switch
                      checkedChildren="可编辑"
                      unCheckedChildren="可编辑"
                      checked={!readOnly}
                      onChange={() => {
                        setReadOnly(!readOnly);
                      }}
                    />
                  )}

                  {editable && (
                    <Button
                      type="primary"
                      onClick={() => {
                        onSave?.({
                          ...rootForm.getFieldsValue(),
                          content: internalNotes,
                        });
                      }}
                    >
                      保存
                    </Button>
                  )}

                  {editable && onDelete && (
                    <Button
                      type="primary"
                      danger
                      style={{ position: 'absolute', right: 16 }}
                      onClick={() => {
                        onDelete();
                      }}
                    >
                      删除
                    </Button>
                  )}

                  {refreshing && <SyncOutlined spin />}
                </Space>
              </Form>
            </div>
          )}

          {/* Mobile 操作栏 */}
          {mobile && (
            <div style={{ flex: 'none', marginBottom: 16 }}>
              <Breadcrumb>
                <Breadcrumb.Item
                  onClick={() => {
                    setPath([]);
                  }}
                >
                  <HomeOutlined />
                </Breadcrumb.Item>
                {path.map((noteIndex, pathIndex) => {
                  return (
                    <Breadcrumb.Item
                      key={pathIndex}
                      onClick={() => {
                        setPath(path.slice(0, pathIndex + 1));
                      }}
                    >
                      {notesList[pathIndex][noteIndex]?.title}
                    </Breadcrumb.Item>
                  );
                })}
              </Breadcrumb>
            </div>
          )}

          <div
            style={{
              flex: 'auto',
              minHeight: 0,
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'start',
                columnGap: 8,
                position: 'relative',
                height: '100%',
              }}
            >
              {/* 笔记列表 */}
              {notesNode}
            </div>
          </div>

          {/* 编辑框 */}
          <Modal
            visible={!!editNotePath && !readOnly}
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
      </DndProvider>
    </div>
  );
}
