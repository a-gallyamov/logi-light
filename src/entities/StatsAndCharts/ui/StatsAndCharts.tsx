import React, { useState, useMemo } from 'react';
import { ContentContainer } from '@shared/ui/ContentContainer';
import {
  Typography,
  Descriptions,
  Flex,
  type TableProps,
  Table,
  Select,
  Alert,
  Space,
  Collapse,
  type CollapseProps,
  type TabsProps,
  Tabs,
  Card,
} from 'antd';

const { Title } = Typography;
const { Option } = Select;

import { parseCSVFile } from '@shared/lib/parseCSVFile';
import BatteryCharts from '@entities/BatteryCharts/BatteryCharts';

interface StatsAndChartsProps {
  csvData?: string;
}

const isNumber = (value: unknown) => Boolean(typeof value === 'number');

const StatsAndCharts = ({ csvData }: StatsAndChartsProps = {}) => {
  const [selectedPhase, setSelectedPhase] = useState<'all' | number>('all');

  const data = useMemo(() => {
    if (!csvData) return;

    return parseCSVFile(csvData, selectedPhase);
  }, [csvData, selectedPhase]);

  const phaseColumns: TableProps['columns'] = [
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
  ];

  const tempColumns: TableProps['columns'] = [
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
  ];

  const phaseSummaryColumns: TableProps['columns'] = [
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
  ];

  // Получаем название выбранной фазы для отображения
  const getSelectedPhaseLabel = () => {
    if (selectedPhase === 'all') {
      return 'Весь цикл';
    }
    const phase = data?.phases?.[selectedPhase as number];
    return phase ? phase.label : 'Неизвестная фаза';
  };

  const collapsedItems: CollapseProps['items'] = [
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
  ];

  const tabsItems: TabsProps['items'] = [
    {
      key: 'summary',
      label: 'Сводка',
      children: (
        <Flex wrap justify="flex-start" align="flex-start" gap={20} style={{ padding: '20px 0' }}>
          <Flex wrap gap={30}>
            {/* Селектор фаз */}

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
  ];

  return (
    <ContentContainer>
      <Collapse items={collapsedItems} />

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
          {data?.phases?.map((phase, index) => (
            <Option key={index} value={index}>
              {phase.label} ({phase.data.length} точек)
            </Option>
          ))}
        </Select>

        {selectedPhase !== 'all' && (
          <Alert message={`Анализ фазы: ${getSelectedPhaseLabel()}`} type="info" showIcon style={{ marginTop: 10 }} />
        )}
      </Space>

      <Card size="small">
        <Tabs tabPosition="left" defaultActiveKey="1" items={tabsItems} />
      </Card>
    </ContentContainer>
  );
};

export default StatsAndCharts;
