import React from 'react';
import { Modal, Form, Input, Icon, Tooltip } from 'antd';
import { connect } from 'dva';

import styles from './Edit.less';

const FormItem = Form.Item;

const STATUS_NONE = 0;
const STATUS_CREATE = 1;
const STATUS_EDIT = 2;

class Edit extends React.Component {
  state = {
    status: STATUS_NONE,
  };

  constructor(props) {
    super(props);

    props.setRef(this);
  }

  onOk = () => {
    const { form: { validateFieldsAndScroll }, list, dispatch } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({
          type: 'memory/saveMemories',
          list: [...list, values],
        }).then(() => {
          this.setState({ status: STATUS_NONE });
          this.onResetForm();
          dispatch({
            type: 'memory/loadList',
          });
        });
      }
    });
  };

  onCancel = () => {
    this.setState({
      status: STATUS_NONE,
    });
  };

  onResetForm = () => {
    this.props.form.resetFields();
  };

  onFileDragOver = (event) => {
    event.preventDefault();
  };

  onFileDrop = (event) => {
    event.preventDefault();

    const { form: { setFieldsValue } } = this.props;

    const { files } = event.dataTransfer;
    this.props.dispatch({
      type: 'assets/upload',
      files,
    }).then(({ fileName }) => {
      const thumbnail = `data/assets/${fileName}`;
      setFieldsValue({
        thumbnail,
      });
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
  }

  createMemory = () => {
    this.setState({
      status: STATUS_CREATE,
    });
  };

  editMemory = () => {
    this.setState({
      status: STATUS_EDIT,
    });
  };

  render() {
    const { status } = this.state;
    const { form: { getFieldDecorator, getFieldValue } } = this.props;

    const $title = (
      <div>
        {status === STATUS_EDIT ? '编辑' : '创建'}
        {' '}
        <Tooltip title="重置表单">
          <small>
            <a onClick={this.onResetForm}>
              <Icon type="sync" />
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
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <Form className={styles.form} onSubmit={this.onSubmit}>
            <FormItem>
              {getFieldDecorator('title', {
                rules: [{ required: true }],
              })(
                <Input placeholder="标题" autoComplete="off" />
              )}
            </FormItem>

            <FormItem>
              {getFieldDecorator('description', {
                rules: [{ required: true }],
              })(
                <Input.TextArea
                  placeholder="描述"
                  rows="3"
                  onDragOver={this.onFileDragOver}
                  onDrop={this.onFileDrop}
                />
              )}
            </FormItem>

            <FormItem>
              {getFieldDecorator('thumbnail', {
                rules: [{ required: true }],
              })(
                <Input
                  autoComplete="off"
                  placeholder="图标"
                  onDragOver={this.onFileDragOver}
                  onDrop={this.onFileDrop}
                />
              )}
            </FormItem>

            <img
              alt={getFieldValue('title')}
              src={`/${getFieldValue('thumbnail')}`}
              onDragOver={this.onFileDragOver}
              onDrop={this.onFileDrop}
            />
          </Form>
        </Modal>
      </div>
    );
  }
}

const mapState = ({ memory: { list } }) => ({
  list,
});

export default connect(mapState)(
  Form.create()(Edit)
);