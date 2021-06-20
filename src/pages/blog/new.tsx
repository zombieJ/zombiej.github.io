import React from 'react';
import {
  Row,
  Col,
  Input,
  Button,
  message,
  Form,
  Checkbox,
  Typography,
} from 'antd';
// import router from 'umi/router';
import marked from 'marked';
// import throttle from 'lodash.throttle';
import classNames from 'classnames';

import styles from './new.less';
import { Article } from './[id]';
import { history } from 'umi';
import RootContext from '@/context';
import { uploadFile } from '@/util';

// const converter = new showdown.Converter();

interface LooperRef {
  onCancel: () => void;
}

const Looper = React.forwardRef((props, ref: React.Ref<LooperRef>) => {
  const [count, setCount] = React.useState(3);
  const idRef = React.useRef<NodeJS.Timeout>();

  const onCancel = () => {
    clearInterval(idRef.current!);
  };

  React.useEffect(() => {
    let currentCount = count;

    idRef.current = setInterval(() => {
      currentCount -= 1;

      if (currentCount >= 0) {
        setCount(currentCount);
      } else {
        history.push('/blog');
      }
    }, 1000);

    return onCancel;
  }, []);

  React.useImperativeHandle(ref, () => ({ onCancel }));

  return (
    <span>
      Save success! Will redirect in {count} seconds... [
      <a onClick={onCancel}>CANCEL</a>]
    </span>
  );
});

export default ({ article }: { article?: Article }) => {
  const { setCollapsed } = React.useContext(RootContext);

  const [form] = Form.useForm();

  const [locked, setLocked] = React.useState(false);
  const [content, setContent] = React.useState('');
  const [contentHTML, setContentHTML] = React.useState('');

  const loopRef = React.useRef<LooperRef>(null);
  const submitRef = React.useRef<HTMLElement>(null);

  // ============================== Load ==============================
  React.useEffect(() => {
    setCollapsed(true);

    if (article) {
      form.setFieldsValue({
        title: article.title,
        content: article.content,
        tagStr: (article.tags || []).join(','),
        hide: article.hide,
      });

      setContent(article.content);
    }
  }, [!!article]);

  // ============================== Edit ==============================
  const onContentChange: React.ChangeEventHandler<HTMLTextAreaElement> = ({
    target: { value },
  }) => {
    setContent(value);
  };

  // ============================== Sync ==============================
  React.useEffect(() => {
    const id = setTimeout(() => {
      setContentHTML(marked(content));
    }, 500);

    return () => {
      clearTimeout(id);
    };
  }, [content]);

  // ============================== Drag ==============================
  const onFileDragOver: React.DragEventHandler = (event) => {
    event.preventDefault();
  };

  const onFileDrop: React.DragEventHandler = async (event) => {
    event.preventDefault();

    const { files } = event.dataTransfer;
    const file = files[0];

    const fileName = await uploadFile(files[0]);

    const oriContent = form.getFieldValue('content') || '';
    const content = `${oriContent}![](data/assets/${fileName})\n\n`;
    form.setFieldsValue({
      content,
    });

    setContent(content);
  };

  // ============================== Save ==============================
  const onSave = () => {
    const { title, tagStr = '', content, hide } = form.getFieldsValue();
    const tagTrim = tagStr.trim();
    const tags = tagTrim ? tagTrim.split(/,|;|，|；/) : [];

    setLocked(true);
    submitRef.current?.focus();

    const url = article ? '/data/articles/edit' : '/data/articles/new';
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        title,
        hide,
        tags,
        content,
        createTime: article?.createTime,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then(() => {
        setLocked(false);
        message.success(
          <span>
            <Looper ref={loopRef} />
          </span>,
          4,
        );
      })
      .catch(() => {
        setLocked(false);
        message.error('Ops! Save failed!');
      });
  };

  // ============================ Keyboard ============================
  const onKeyDown: React.KeyboardEventHandler = (event) => {
    if (event.which === 27) {
      loopRef.current?.onCancel();
      message.destroy();
    } else if (event.which === 13 && (event.ctrlKey || event.metaKey)) {
      onSave();
    }
  };

  // ============================= Render =============================
  return (
    <div onKeyDown={onKeyDown}>
      <Row gutter={32}>
        <Col span={12}>
          <Form
            form={form}
            onFinish={onSave}
            className={styles.full}
            layout="vertical"
          >
            <div className={styles.editor}>
              <Form.Item
                className={styles['form-item']}
                name="title"
                label="Title"
                rules={[{ required: true }]}
              >
                <Input disabled={locked} autoComplete="off" autoFocus />
              </Form.Item>

              <Form.Item
                className={styles['form-item']}
                name="tagStr"
                label="Tags"
              >
                <Input
                  disabled={locked}
                  autoComplete="off"
                  placeholder="Split by `,`..."
                />
              </Form.Item>

              <Form.Item
                className={classNames(styles['form-item'], styles['flex'])}
                name="content"
                label="Content"
                rules={[{ required: true }]}
              >
                <Input.TextArea
                  disabled={locked}
                  onDragOver={onFileDragOver}
                  onDrop={onFileDrop}
                  onChange={onContentChange}
                  autoSize={{ minRows: 10 }}
                />
              </Form.Item>

              <div>
                <Row>
                  <Col span={12}>
                    <Button ref={submitRef} type="primary" htmlType="submit">
                      {article ? '更新文章' : '保存文章'}
                    </Button>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Form.Item
                      className={classNames(
                        styles['form-item'],
                        styles['flex'],
                      )}
                      name="hide"
                      valuePropName="checked"
                    >
                      <Checkbox disabled={locked}>隐藏文章</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
          </Form>
        </Col>
        <Col span={12} className={styles.full}>
          <Typography>
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: contentHTML }}
            />
          </Typography>
        </Col>
      </Row>
    </div>
  );
};
