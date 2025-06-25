import BatteryCharts from '@entities/BatteryCharts/BatteryCharts';
import { parseCSVFile } from '@shared/lib/parseCSVFile';
import { ContentContainer } from '@shared/ui/ContentContainer';
import {
  Alert,
  Card,
  Collapse,
  type CollapseProps,
  Descriptions,
  Flex,
  Select,
  Space,
  Table,
  type TableProps,
  Tabs,
  type TabsProps,
  Typography,
} from 'antd';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

interface StatsAndChartsProps {
  fileId: string;
  csvData?: string;
}

interface FileState {
  activeTab: string;
  selectedPhase: 'all' | number;
}

const isNumber = (value: unknown) => Boolean(typeof value === 'number');

const StatsAndCharts = memo(({ csvData, fileId }: StatsAndChartsProps) => {
  const STORAGE_KEY = `battery-analyzer-${fileId}`;

  // Загружаем сохраненное состояние из sessionStorage
  const loadSavedState = useCallback((): FileState => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          activeTab: parsed.activeTab || 'summary',
          selectedPhase: parsed.selectedPhase ?? 'all',
        };
      }
    } catch (error) {
      console.warn('Ошибка загрузки состояния из sessionStorage:', error);
    }
    return { activeTab: 'summary', selectedPhase: 'all' };
  }, [STORAGE_KEY]);

  const savedState = loadSavedState();
  const [selectedPhase, setSelectedPhase] = useState<'all' | number>(savedState.selectedPhase);
  const [activeTab, setActiveTab] = useState(savedState.activeTab);

  // Сохраняем состояние в sessionStorage при изменении
  useEffect(() => {
    try {
      const stateToSave: FileState = {
        activeTab,
        selectedPhase,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Ошибка сохранения состояния в sessionStorage:', error);
    }
  }, [activeTab, selectedPhase, STORAGE_KEY]);

  const data = useMemo(() => {
    if (!csvData) return;

    return parseCSVFile(csvData, selectedPhase);
  }, [csvData, selectedPhase]);

  const phaseColumns: TableProps['columns'] = useMemo(
    () => [
      {
        title: 'Фаза',
        dataIndex: 'phase',
        key: 'phase',
      },
      {
        title: 'Время',
        dataIndex: 'time',
        key: 'time',
        align: 'center',
      },
      {
        title: 'Напряжение',
        dataIndex: 'voltage',
        key: 'voltage',
        align: 'center',
      },
      {
        title: 'Ток',
        dataIndex: 'current',
        key: 'current',
        align: 'center',
      },
      {
        title: 'Доля цикла',
        dataIndex: 'cycle',
        key: 'cycle',
        align: 'center',
      },
    ],
    [],
  );

  const tempColumns: TableProps['columns'] = useMemo(
    () => [
      {
        title: 'Параметр',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
      },
      {
        title: 'Начало',
        dataIndex: 'start',
        key: 'start',
        align: 'center',
      },
      {
        title: 'Максимум',
        dataIndex: 'max',
        key: 'max',
        align: 'center',
      },
      {
        title: 'Прирост',
        dataIndex: 'growth',
        key: 'growth',
        align: 'center',
      },
    ],
    [],
  );

  const phaseSummaryColumns: TableProps['columns'] = useMemo(
    () => [
      {
        title: 'Фаза',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Длительность',
        dataIndex: 'duration',
        key: 'duration',
        align: 'center',
      },
      {
        title: 'Начало',
        dataIndex: 'startTime',
        key: 'startTime',
        align: 'center',
      },
      {
        title: 'Конец',
        dataIndex: 'endTime',
        key: 'endTime',
        align: 'center',
      },
      {
        title: 'Точки',
        dataIndex: 'points',
        key: 'points',
        align: 'center',
      },
      {
        title: 'Средний ток',
        dataIndex: 'avgCurrent',
        key: 'avgCurrent',
        align: 'center',
      },
      {
        title: 'Диапазон напряжений',
        dataIndex: 'voltageRange',
        key: 'voltageRange',
        align: 'center',
      },
    ],
    [],
  );

  // Получаем название выбранной фазы для отображения
  const getSelectedPhaseLabel = useCallback(() => {
    if (selectedPhase === 'all') {
      return 'Весь цикл';
    }
    const phase = data?.phases?.[selectedPhase as number];
    return phase ? phase.label : 'Неизвестная фаза';
  }, [data?.phases, selectedPhase]);

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  const collapsedItems: CollapseProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: 'Обнаруженные фазы',
        children: data?.phasesSummary && data.phasesSummary.length > 1 && (
          <div style={{ width: '100%' }}>
            <Title level={5}>Обнаруженные фазы</Title>
            <Table
              style={{ width: '100%' }}
              pagination={false}
              columns={phaseSummaryColumns}
              dataSource={data.phasesSummary}
              bordered
              rowHoverable
              size="small"
              scroll={{ x: 640 }}
            />
          </div>
        ),
      },
    ],
    [data?.phasesSummary, phaseSummaryColumns],
  );

  const tabsItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'summary',
        label: 'Сводка',
        children: (
          <Flex wrap justify="flex-start" align="flex-start" gap={20} style={{ padding: '20px 0' }}>
            <Flex wrap gap={30}>
              <Descriptions
                title={selectedPhase === 'all' ? 'Сводка полного цикла' : `Сводка фазы: ${getSelectedPhaseLabel()}`}
                items={data?.chargeSummary.component ?? []}
                bordered
                styles={{ label: { width: 237 } }}
              />

              <Descriptions
                title="Эффективность"
                items={data?.efficiency.component ?? []}
                bordered
                styles={{ label: { width: 237 } }}
              />

              <Descriptions
                title="Качество питания"
                items={data?.powerQuality.component ?? []}
                bordered
                styles={{ label: { width: 237 } }}
                style={{ display: data?.powerQuality.component?.length === 0 ? 'none' : undefined }}
              />

              <Descriptions
                title="Расчетные параметры"
                items={data?.calculatedParams.component ?? []}
                bordered
                styles={{ label: { width: 237 } }}
              />

              {/* Показываем фазы CC/CV только для фаз заряда */}
              {(selectedPhase === 'all' || (isNumber(selectedPhase) && data?.phases?.[selectedPhase]?.type === 'charge')) && (
                <Flex vertical style={{ width: '100%' }}>
                  <Title level={5}>{selectedPhase === 'all' ? 'Фазы заряда' : 'Подфазы заряда (CC/CV)'}</Title>
                  <Table
                    style={{ width: '100%' }}
                    pagination={false}
                    columns={phaseColumns}
                    dataSource={data?.ccCvPhases}
                    bordered
                    rowHoverable
                    size="small"
                  />
                </Flex>
              )}

              <Flex vertical style={{ width: '100%' }}>
                <Title level={5}>Тепловые характеристики</Title>
                <Table
                  style={{ width: '100%' }}
                  pagination={false}
                  columns={tempColumns}
                  dataSource={data?.thermalCharacteristics}
                  bordered
                  rowHoverable
                  size="small"
                />
              </Flex>
            </Flex>
          </Flex>
        ),
      },
      {
        key: 'chart',
        label: 'График',
        children: <BatteryCharts phases={Array.isArray(data?.phases) ? data.phases : []} selectedPhase={selectedPhase} />,
      },
    ],
    [
      data?.calculatedParams.component,
      data?.ccCvPhases,
      data?.chargeSummary.component,
      data?.efficiency.component,
      data?.phases,
      data?.powerQuality.component,
      data?.thermalCharacteristics,
      getSelectedPhaseLabel,
      phaseColumns,
      selectedPhase,
      tempColumns,
    ],
  );

  return (
    <ContentContainer>
      {Boolean(data?.phasesSummary && data.phasesSummary.length > 1) && <Collapse items={collapsedItems} />}

      <Space direction="vertical" style={{ width: '100%', margin: '20px 0' }}>
        <Title level={5}>Выбор фазы для анализа</Title>
        <Select
          value={selectedPhase}
          onChange={(value) => {
            setSelectedPhase(value);
          }}
          style={{ width: '100%' }}
          placeholder="Выберите фазу для анализа"
        >
          <Option value="all">🔄 Весь цикл</Option>
          {data?.phases?.map(({ label, type, startIndex, endIndex, data }, index) => (
            <Option key={`${type}_${label}_${startIndex}_${endIndex}`} value={index}>
              {label} ({data.length} точек)
            </Option>
          ))}
        </Select>

        {selectedPhase !== 'all' && (
          <Alert message={`Анализ фазы: ${getSelectedPhaseLabel()}`} type="info" showIcon style={{ marginTop: 10 }} />
        )}
      </Space>

      <Card size="small">
        <Tabs tabPosition="left" defaultActiveKey="1" activeKey={activeTab} items={tabsItems} onChange={handleTabChange} />
      </Card>
    </ContentContainer>
  );
});

// eslint-disable-next-line import-x/no-default-export
export default StatsAndCharts;
