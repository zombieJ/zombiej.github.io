import React from 'react';
import { mutate } from 'swr';
import { Form, Input, Button, message } from 'antd';
import RootContext from '../../context';

const FormItem = Form.Item;

export default () => {
  const { dateFormat, title, abbrTitle } = React.useContext(RootContext);

  const onFinish = (values: object) => {
    fetch('/data/config/save', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: {
        'content-type': 'application/json',
      },
    }).then(async () => {
      await mutate('/data/config.json');
      message.success('Update success!');
    });
  };

  return (
    <div>
      <Form
        onFinish={onFinish}
        initialValues={{ dateFormat, title, abbrTitle }}
        layout="vertical"
      >
        <FormItem
          label="Title"
          name="title"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input autoComplete="off" />
        </FormItem>

        <FormItem
          label="Abbr Title"
          name="abbrTitle"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input autoComplete="off" />
        </FormItem>

        <FormItem
          label="Date Format"
          name="dateFormat"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input autoComplete="off" />
        </FormItem>

        <FormItem>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
