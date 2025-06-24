import React from 'react';
import { FileAddOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { Upload, Typography } from 'antd';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

export type TImportCsvProps = {
  onDropFile: ({ fileList }: { fileList: UploadFile[] }) => void;
};

const ImportCsv = ({ onDropFile }: TImportCsvProps) => {
  return (
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
  );
};

export default ImportCsv;
