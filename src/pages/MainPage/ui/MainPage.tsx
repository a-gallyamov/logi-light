import { useRef, useState, type MouseEvent, type KeyboardEvent } from 'react';
import { Tabs, type TabsProps, type UploadFile } from 'antd';
import { v4 as uuid } from 'uuid';

import { StatsAndCharts } from '@entities/StatsAndCharts';
import { ContentContainer } from '@shared/ui/ContentContainer';

import cls from './MainPage.module.scss';
import { ImportCsv, type TImportCsvProps } from '@entities/ImportCSV';

const MainPage = () => {
  const handleDragFile = ({ fileList }: { fileList: UploadFile[] }) => {
    console.log('fileList', fileList);
  };

  const initialItems: TabsProps['items'] = [
    { label: 'Tab 1', children: <StatsAndCharts />, key: uuid() },
    { label: 'Импортировать файл', children: <ImportCsv onDropFile={handleDragFile} />, key: '2', closable: false },
  ];

  const [activeKey, setActiveKey] = useState(initialItems?.[0]?.key);
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const add = () => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    const newPanes = [...items];
    newPanes.push({ label: 'New Tab', children: <>Content of new Tab</>, key: newActiveKey });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  };

  const onEdit = (targetKey: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'add') {
      add();
    } else {
      console.log('remove', targetKey);
    }
  };

  return (
    <ContentContainer>
      <div className={cls.mainTabs}>
        <Tabs type="editable-card" hideAdd onChange={onChange} activeKey={`${activeKey}`} onEdit={onEdit} items={items} />
      </div>
    </ContentContainer>
  );
};

export default MainPage;
