import { ImportCsv } from '@entities/ImportCSV';
import { StatsAndCharts } from '@entities/StatsAndCharts';
import { ContentContainer } from '@shared/ui/ContentContainer';
import { Tabs, type TabsProps, type UploadFile } from 'antd';
import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import cls from './MainPage.module.scss';

const MainPage = () => {
  const handleDragFile = useCallback(({ fileList }: { fileList: UploadFile[] }) => {
    const file = fileList[0];
    if (!file?.originFileObj) return;

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      const csvContent = e.target?.result as string;
      if (csvContent) {
        const newTabKey = uuid();
        const fileName = file.name || 'Неизвестный файл';

        const newTab = {
          label: fileName.replace('.csv', ''),
          children: <StatsAndCharts fileId={newTabKey} csvData={csvContent} />,
          key: newTabKey,
          closable: true,
        };

        setItems((prev) => [newTab, ...prev]);
        setActiveKey(newTabKey);
      }
    });

    reader.readAsText(file?.originFileObj);
  }, []);

  const initialItems: TabsProps['items'] = useMemo(
    () => [{ label: 'Импортировать файл', children: <ImportCsv onDropFile={handleDragFile} />, key: '2', closable: false }],
    [handleDragFile],
  );

  const [activeKey, setActiveKey] = useState(initialItems?.[0]?.key);
  const [items, setItems] = useState(initialItems);

  const onChange = useCallback((newActiveKey: string) => {
    setActiveKey(newActiveKey);
  }, []);

  const onEdit = (targetKey: MouseEvent | KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      setItems((prevState) => {
        const result = prevState.filter((tab) => tab.key !== targetKey);
        setActiveKey(result?.[0]?.key);
        return result;
      });
    }
  };

  return (
    <ContentContainer>
      <div className={cls.mainTabs}>
        <Tabs
          destroyOnHidden
          type="editable-card"
          hideAdd
          onChange={onChange}
          activeKey={`${activeKey}`}
          onEdit={onEdit}
          items={items}
        />
      </div>
    </ContentContainer>
  );
};

// eslint-disable-next-line import-x/no-default-export
export default MainPage;
