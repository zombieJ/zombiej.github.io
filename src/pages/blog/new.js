import React from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Button, message, Form } from 'antd';
import router from 'umi/router';
import showdown from 'showdown';
import throttle from 'lodash.throttle';
import classNames from 'classnames';

import styles from './new.less';

const converter = new showdown.Converter();

class Looper extends React.Component {
  state = {
    count: 5,
  };

  componentDidMount() {
    this.id = setInterval(() => {
      const count = this.state.count - 1;

      if (count >= 0) {
        this.setState({ count });
      } else {
        router.push('/blog');
        clearInterval(this.id);
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  render() {
    return this.state.count;
  }
}

class New extends React.Component {
  constructor() {
    super();

    this.throttleRefreshArtitle = throttle(this.refreshArticle, 200);
  }

  state = {
    lock: false,
  };

  componentDidMount() {
    setTimeout(() => {
      this.$input.focus();
    }, 100);

    this.props.dispatch({
      type: 'global/triggerCollapse',
      collapsed: true,
    });
  }

  onFileDragOver = (event) => {
    event.preventDefault();
  };

  onFileDrop = (event) => {
    event.preventDefault();

    const { files } = event.dataTransfer;
    this.props.dispatch({
      type: 'assets/upload',
      files,
    });
  };
  
  onContentChange = ({ target: { value } }) => {
    this.throttleRefreshArtitle(value);
  };

  onKeyDown = (event) => {
    if (event.which === 13 && (event.ctrlKey || event.metaKey)) {
      this.save(event);
    }
  };

  inputRef = (ele) => {
    this.$input = ele;
  };

  refreshArticle = (content) => {
    this.setState({
      contentHTML: converter.makeHtml(content),
    });
  };

  save = (e) => {
    e.preventDefault();

    const { form } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { title, tagStr = '', content } = values;
        const tagTrim = tagStr.trim();
        const tags = tagTrim ? tagTrim.split(/,|;|，|；/) : [];

        this.setState({ lock: true });

        this.props.dispatch({
          type: 'article/saveArticle',
          title,
          tags,
          content,
        }).then(() => {
          this.setState({ lock: false });
          message.success(
            <span>
              Save success! Will redrect in <Looper /> seconds...
            </span>,
            6,
          );
        }).catch(() => {
          this.setState({ lock: false });
          message.error('Ops! Save failed!');
        });
      }
    });
  };

  render() {
    const { title, tagStr, content, contentHTML, lock } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div onKeyDown={this.onKeyDown}>
        <Row gutter={32}>
          <Col span={12}>
            <Form onSubmit={this.save} className={styles.full}>
              <div className={styles.editor}>
                <Form.Item className={styles['form-item']}>
                  {getFieldDecorator('title', {
                    rules: [{ required: true }],
                  })(
                    <Input
                      disabled={lock}
                      autoComplete="off"
                      placeholder="Title..."
                      ref={this.inputRef}
                    />
                  )}
                </Form.Item>

                <Form.Item className={styles['form-item']}>
                  {getFieldDecorator('tagStr')(
                    <Input
                      disabled={lock}
                      autoComplete="off"
                      placeholder="Tags..."
                    />
                  )}
                </Form.Item>

                 <Form.Item className={classNames(styles['form-item'], styles['flex'])}>
                  {getFieldDecorator('content', {
                    rules: [{ required: true }],
                  })(
                    <Input.TextArea
                      disabled={lock}
                      placeholder="content..."
                      onDragOver={this.onFileDragOver}
                      onDrop={this.onFileDrop}
                      onChange={this.onContentChange}
                    />
                  )}
                </Form.Item>
                
                
                <div>
                  <Button disabled={lock} type="primary" htmlType="submit">保存文章</Button>
                </div>
              </div>
            </Form>
          </Col>
          <Col span={12} className={styles.full}>
            <div className={styles.preview} dangerouslySetInnerHTML={{ __html: contentHTML }} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect()(Form.create()(New));