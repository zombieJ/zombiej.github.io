import React from 'react';
import { Modal, Form, Input, Tooltip } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { mutate } from 'swr';
import { uploadFile } from '@/util';
import styles from './Edit.less';
import { Memory } from '..';

const FormItem = Form.Item;

const STATUS_NONE = 0;
const STATUS_CREATE = 1;
const STATUS_EDIT = 2;

export interface MemoryEditRef {
  createMemory: () => void;
}

export default React.forwardRef<MemoryEditRef, { list: Memory[] }>(
  ({ list }, ref) => {
    const [form] = Form.useForm();

    const [status, setStatus] = React.useState<
      typeof STATUS_NONE | typeof STATUS_CREATE | typeof STATUS_EDIT
    >(STATUS_NONE);

    React.useImperativeHandle(ref, () => ({
      createMemory: () => {
        setStatus(STATUS_CREATE);
      },
    }));

    // =========================== Upload ===========================
    const onFileDragOver: React.DragEventHandler = (event) => {
      event.preventDefault();
    };

    const onFileDrop: React.DragEventHandler = async (event) => {
      event.preventDefault();

      const { files } = event.dataTransfer;
      const fileName = await uploadFile(files[0]);

      const thumbnail = `data/assets/${fileName}`;
      form.setFieldsValue({
        thumbnail,
      });
    };

    const onFinish = (values: object) => {
      fetch('/data/memories/save', {
        method: 'POST',
        body: JSON.stringify([...list, values]),
        headers: {
          'content-type': 'application/json',
        },
      }).then(() => {
        setStatus(STATUS_NONE);
        form.resetFields();
        mutate('/data/memoryList.json');
      });
    };

    // =========================== Render ===========================
    const $title = (
      <div>
        {status === STATUS_EDIT ? '编辑' : '创建'}{' '}
        <Tooltip title="重置表单">
          <small>
            <a
              onClick={() => {
                form.resetFields();
              }}
            >
              <SyncOutlined />
            </a>
          </small>
        </Tooltip>
      </div>
    );

    return (
      <div>
        <Modal
          title={$title}
          visible={status !== STATUS_NONE}
          onOk={() => {
            form.submit();
          }}
          onCancel={() => {
            setStatus(STATUS_NONE);
          }}
        >
          <Form form={form} className={styles.form} onFinish={onFinish}>
            <FormItem name="title" rules={[{ required: true }]}>
              <Input placeholder="标题" autoComplete="off" />
            </FormItem>

            <FormItem name="description" rules={[{ required: true }]}>
              <Input.TextArea
                placeholder="描述"
                rows={3}
                onDragOver={onFileDragOver}
                onDrop={onFileDrop}
              />
            </FormItem>

            <FormItem name="thumbnail" rules={[{ required: true }]}>
              <Input
                autoComplete="off"
                placeholder="图标"
                onDragOver={onFileDragOver}
                onDrop={onFileDrop}
              />
            </FormItem>

            <Form.Item noStyle shouldUpdate>
              {() => (
                <img
                  alt={form.getFieldValue('title')}
                  src={`/${form.getFieldValue('thumbnail')}`}
                  onDragOver={onFileDragOver}
                  onDrop={onFileDrop}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  },
);
