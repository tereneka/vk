import TextArea from 'antd/es/input/TextArea';
import {
  Button,
  DatePicker,
  Form,
  Select,
  TimePicker,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

function App() {
  const [form] = Form.useForm();

  const floorOptions = [];

  for (let i = 3; i <= 27; i++) {
    floorOptions.push({ value: i, label: i });
  }

  const roomOptions = [];

  for (let i = 1; i <= 10; i++) {
    roomOptions.push({ value: i, label: i });
  }

  const dateFormat = 'DD.MM.YYYY';

  const timeFormat = 'HH:mm';

  const [messageApi, messageContextHolder] =
    message.useMessage();

  const [isToday, setIsToday] = useState(false);
  const [
    disabledTodayTime,
    setDisabledTodayTime,
  ] = useState([]);

  useEffect(() => {
    if (isToday) {
      const arr = [];
      for (let i = 8; i <= dayjs().hour(); i++) {
        arr.push(i);
      }
      setDisabledTodayTime(arr);
    } else {
      setDisabledTodayTime([]);
    }
  }, [isToday]);

  // заблокировала бронирование на выходные дни, текущий день после 19:00 и до текущей даты
  const disabledDate = (current) => {
    const isWeekend =
      current.day() === 0 || current.day() === 6;

    return dayjs().hour() > 18
      ? current < dayjs().endOf('d') || isWeekend
      : current < dayjs().startOf('d') ||
          isWeekend;
  };

  // ограничила выбор времени для бронирования рабочими часами
  const disabledRangeTime = (_, type) => {
    const arr1 = [];
    const arr2 = [];

    for (let i = 0; i < 8; i++) {
      arr1.push(i);
    }

    for (let i = 19; i <= 24; i++) {
      arr2.push(i);
    }

    if (type === 'start') {
      return {
        disabledHours: () =>
          arr1
            .concat(arr2)
            .concat(disabledTodayTime),
      };
    }
    return {
      disabledHours: () =>
        arr1
          .concat(arr2.slice(1))
          .concat(disabledTodayTime),
      disabledMinutes: (selectedHour) =>
        selectedHour === 19 ? [30] : [],
    };
  };

  function handleDateChange(date) {
    if (date) {
      setIsToday(
        date?.format(dateFormat) ===
          dayjs().format(dateFormat)
      );
    } else {
      setIsToday(false);
    }

    form.resetFields(['time']);
  }

  function handleFormReset() {
    form.resetFields();
  }

  function showMessage(values, date, time) {
    messageApi.open({
      type: 'success',
      content: (
        <>
          Переговорная успешно забронирована:
          <ul className='form__message-list'>
            <li>башня - {values.tower}</li>
            <li>этаж - {values.floor}</li>
            <li>переговорка - {values.room}</li>
            <li>дата - {date}</li>
            <li>время - {time}</li>
          </ul>
        </>
      ),
      className: 'form__message',
    });
  }

  function handleFormSubmit(values) {
    const date = values.date.format(dateFormat);
    const time = values.time
      .map((i) => i.format(timeFormat))
      .join(' - ');

    showMessage(values, date, time);

    console.log(
      JSON.stringify({
        ...values,
        date,
        time,
      })
    );

    form.resetFields();
  }

  return (
    <>
      <header className='header root__header'>
        <h1 className='header__title'>
          Форма бронирования переговорных комнат
        </h1>
      </header>

      <main className='content'>
        <Form
          className='form'
          name='basic'
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          onFinish={handleFormSubmit}>
          <Form.Item
            label='Башня'
            name='tower'
            rules={[
              {
                required: true,
                message: 'Выберите башню',
              },
            ]}>
            <Select
              options={[
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label='Этаж'
            name='floor'
            rules={[
              {
                required: true,
                message: 'Выберите этаж',
              },
            ]}>
            <Select options={floorOptions} />
          </Form.Item>

          <Form.Item
            label='Переговорка'
            name='room'
            rules={[
              {
                required: true,
                message:
                  'Выберите переговорную комнату',
              },
            ]}>
            <Select options={roomOptions} />
          </Form.Item>

          <Form.Item
            label='Дата'
            name='date'
            rules={[
              {
                required: true,
                message: 'Выберите дату',
              },
            ]}>
            <DatePicker
              className='form__date-item'
              format={dateFormat}
              disabledDate={disabledDate}
              onChange={handleDateChange}
            />
          </Form.Item>

          <Form.Item
            label='Время'
            name='time'
            rules={[
              {
                required: true,
                message: 'Выберите время',
              },

              {
                validator: (_, values) =>
                  !values ||
                  values[0].format(timeFormat) !==
                    values[1].format(timeFormat)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          'Время начала и окончания не должны совпадать'
                        )
                      ),
              },
            ]}>
            <TimePicker.RangePicker
              className='form__date-item'
              format={timeFormat}
              minuteStep={30}
              disabledTime={disabledRangeTime}
              hideDisabledOptions
            />
          </Form.Item>

          <Form.Item
            label='Комментарии'
            name='comments'>
            <TextArea />
          </Form.Item>

          <Form.Item
            wrapperCol={{ offset: 6, span: 14 }}>
            <Button
              type='primary'
              htmlType='submit'>
              Отправить
            </Button>
            <Button
              htmlType='button'
              onClick={handleFormReset}>
              Сбросить
            </Button>
          </Form.Item>
          {messageContextHolder}
        </Form>
      </main>
    </>
  );
}

export default App;
