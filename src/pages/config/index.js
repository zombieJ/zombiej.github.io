import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, message } from 'antd';

const FormItem = Form.Item;

class Config extends React.Component {
  onSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.dispatch({
          type: 'global/updateConfig',
          ...values,
        }).then(() => {
          message.success('Update success!');
        });
      }
    });
  };

  render() {
    const {
      title, dateFormat,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <div>
        <Form onSubmit={this.onSubmit}>
          <FormItem
            label="Title"
          >
            {getFieldDecorator('title', {
              initialValue: title,
              rules: [{
                required: true,
              }],
            })(
              <Input autoComplete="off" />
            )}
          </FormItem>

          <FormItem
            label="Date Format"
          >
            {getFieldDecorator('dateFormat', {
              initialValue: dateFormat,
              rules: [{
                required: true,
              }],
            })(
              <Input autoComplete="off" />
            )}
          </FormItem>

          <FormItem>
            <Button type="primary" htmlType="submit">Update</Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const mapState = ({ global: { title, dateFormat } }) => ({
  title,
  dateFormat,
});

export default connect(mapState)(Form.create()(Config));