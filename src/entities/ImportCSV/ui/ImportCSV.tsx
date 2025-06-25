import { FileAddOutlined } from '@ant-design/icons';
import { Collapse, type CollapseProps, Space, Table, type TableProps, type UploadFile } from 'antd';
import { Typography, Upload } from 'antd';
import React from 'react';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

export interface TImportCsvProps {
  onDropFile: ({ fileList }: { fileList: UploadFile[] }) => void;
}

const columns: TableProps['columns'] = [
  {
    title: 'Позиция',
    dataIndex: 'position',
    key: 'position',
    width: 20,
    align: 'center',
  },
  {
    title: 'Название переменной',
    dataIndex: 'variableName',
    key: 'variableName',
    align: 'center',
    width: 150,
    render: (text) => <Text code>{text}</Text>,
  },
  {
    title: 'Тип данных',
    dataIndex: 'dataType',
    key: 'dataType',
    width: 100,
    align: 'center',
    render: (text) => <Text code>{text}</Text>,
  },
  {
    title: 'Описание',
    dataIndex: 'description',
    key: 'description',
    width: 200,
  },
];

const dataSource = [
  {
    key: '1',
    position: 0,
    variableName: 'timestamp',
    dataType: 'number',
    description: 'Временная метка',
  },
  {
    key: '2',
    position: 1,
    variableName: 'voltage',
    dataType: 'number',
    description: 'Напряжение АКБ (В)',
  },
  {
    key: '3',
    position: 2,
    variableName: 'current',
    dataType: 'number',
    description: 'Ток АКБ (А)',
  },
  {
    key: '4',
    position: 3,
    variableName: 'ah',
    dataType: 'number',
    description: 'Накопленная емкость (Ач)',
  },
  {
    key: '5',
    position: 4,
    variableName: 'powerVoltage',
    dataType: 'number',
    description: 'Напряжение БП (В)',
  },
  {
    key: '6',
    position: 5,
    variableName: 'tempQ1',
    dataType: 'number',
    description: 'Температура Q1 (°C)',
  },
  {
    key: '7',
    position: 6,
    variableName: 'tempAkb',
    dataType: 'number',
    description: 'Температура АКБ (°C)',
  },
];

const items: CollapseProps['items'] = [
  {
    key: '1',
    label: 'Порядок обработки столбцов',
    children: (
      <Space direction="vertical" size="small">
        <Table columns={columns} dataSource={dataSource} pagination={false} bordered size="small" />

        <Text type="secondary">
          Фильтрация: исключаются записи с timestamp = 0 и дубликаты. При ошибке парсинга значение заменяется на 0
        </Text>
      </Space>
    ),
  },
];

const styledCollapse = { marginTop: 20 };

const ImportCsv = ({ onDropFile }: TImportCsvProps) => {
  return (
    <>
      <Dragger multiple={false} accept=".csv" beforeUpload={() => false} showUploadList={false} onChange={onDropFile}>
        <p className="ant-upload-drag-icon">
          <FileAddOutlined />
        </p>
        <Paragraph>
          <Text>Нажмите или перетащите файл в это поле для обработки</Text>
        </Paragraph>

        <Paragraph>
          <Text type="secondary">
            Доступные форматы: <Text code>.csv</Text>
          </Text>
        </Paragraph>
      </Dragger>

      <Collapse size="small" items={items} style={styledCollapse} />
    </>
  );
};

// eslint-disable-next-line import-x/no-default-export
export default ImportCsv;
