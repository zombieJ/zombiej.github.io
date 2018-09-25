import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import { Row, Col, Input, Button, message, Form, Checkbox } from 'antd';
import router from 'umi/router';
import showdown from 'showdown';
import throttle from 'lodash.throttle';
import classNames from 'classnames';

import styles from './new.less';

const converter = new showdown.Converter();

class Looper extends React.Component {
  state = {
    count: 3,
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

  onCancel = () => {
    clearInterval(this.id);
  };

  render() {
    return (
      <span>
        Save success! Will redrect in {this.state.count} seconds...
        [<a onClick={this.onCancel}>CANCEL</a>]
      </span>
    );
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

    // Collapse the sidebar
    this.props.dispatch({
      type: 'global/triggerCollapse',
      collapsed: true,
    });

    // Set article
    const { article, form: { setFieldsValue } } = this.props;
    if (article) {
      setFieldsValue({
        title: article.title,
        content: article.content,
        tagStr: (article.tags || []).join(','),
        hide: article.hide,
      });

      this.throttleRefreshArtitle(article.content);
    }
  }

  onFileDragOver = (event) => {
    event.preventDefault();
  };

  onFileDrop = (event) => {
    event.preventDefault();

    const { form: { getFieldValue, setFieldsValue } } = this.props;

    const { files } = event.dataTransfer;
    this.props.dispatch({
      type: 'assets/upload',
      files,
    }).then(({ fileName }) => {
      const oriContent = getFieldValue('content') || '';
      const content = `${oriContent}![](data/assets/${fileName})\n\n`;
      setFieldsValue({
        content,
      });

      this.throttleRefreshArtitle(content);
    });
  };
  
  onContentChange = ({ target: { value } }) => {
    this.throttleRefreshArtitle(value);
  };

  onKeyDown = (event) => {
    if (event.which === 27) {
      if (this.$looper) {
        this.$looper.onCancel();
      }
      message.destroy();
    } else if (event.which === 13 && (event.ctrlKey || event.metaKey)) {
      this.save(event);
    }
  };

  setLooperRef = (looper) => {
    this.$looper = looper;
  };

  setSumbitRef = (submit) => {
    this.$submit = ReactDOM.findDOMNode(submit);
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

    if (this.state.lock) return;

    const { form, article } = this.props;

    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { title, tagStr = '', content, hide } = values;
        const tagTrim = tagStr.trim();
        const tags = tagTrim ? tagTrim.split(/,|;|，|；/) : [];

        this.setState({ lock: true });
        this.$submit.focus();

        this.props.dispatch({
          type: article ? 'article/editArticle' : 'article/saveArticle',
          title,
          hide,
          tags,
          content,
          createTime: article ? article.createTime : null,
        }).then(() => {
          this.setState({ lock: false });
          message.success(
            <span>
              <Looper ref={this.setLooperRef} />
            </span>,
            4,
          );
        }).catch(() => {
          this.setState({ lock: false });
          message.error('Ops! Save failed!');
        });
      }
    });
  };

  render() {
    const { contentHTML, lock } = this.state;
    const { article, form: { getFieldDecorator } } = this.props;

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
                  <Row>
                    <Col span={12}>
                      <Button ref={this.setSumbitRef} type="primary" htmlType="submit">
                        {article ? '更新文章' : '保存文章'}
                      </Button>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Form.Item className={classNames(styles['form-item'], styles['flex'])}>
                        {getFieldDecorator('hide', {
                          valuePropName: 'checked',
                        })(
                          <Checkbox
                            disabled={lock}
                          >
                            隐藏文章
                          </Checkbox>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
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