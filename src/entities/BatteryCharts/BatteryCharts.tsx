import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { Phase } from '@shared/lib/parseCSVFile';

const styles = {
  container: {
    padding: '1px 20px 20px 20px',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#262626',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '12px',
    color: '#595959',
  },
  select: {
    width: '100%',
    maxWidth: '400px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d9d9d9',
    fontSize: '14px',
    backgroundColor: '#fff',
  },
  grid: {
    display: 'grid',
    gap: '16px',
    marginTop: '20px',
  },
  gridCols1: {
    gridTemplateColumns: '1fr',
  },
  gridCols2: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f0f0f0',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '16px',
    color: '#262626',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '8px',
  },
};

const BatteryCharts = ({ phases, selectedPhase }: { phases: Phase[]; selectedPhase: number | 'all' }) => {
  const analysisData = useMemo(() => {
    if (selectedPhase === 'all') {
      return Array.isArray(phases) ? phases.reduce((acc, phase) => acc.concat(phase.data), []) : [];
    }

    return phases[selectedPhase]?.data || [];
  }, [phases, selectedPhase]);

  // 1. График напряжения и тока во времени
  const voltageCurrentOption = useMemo(() => {
    const timeData = analysisData.map((d) => new Date(d.timestamp * 1000));
    const voltageData = analysisData.map((d) => d.voltage);
    const currentData = analysisData.map((d) => d.current);

    // Создаем зоны для фаз
    const markAreas = [];
    if (selectedPhase === 'all') {
      phases.forEach((phase) => {
        if (phase.data.length > 0) {
          const startTime = new Date(phase.data[0].timestamp * 1000);
          const endTime = new Date(phase.data[phase.data.length - 1].timestamp * 1000);
          markAreas.push([
            {
              name: phase.label,
              xAxis: startTime,
              itemStyle: {
                color:
                  phase.type === 'charge'
                    ? 'rgba(82, 196, 26, 0.1)'
                    : phase.type === 'discharge'
                      ? 'rgba(245, 34, 45, 0.1)'
                      : 'rgba(250, 173, 20, 0.1)',
              },
            },
            {
              xAxis: endTime,
            },
          ]);
        }
      });
    }

    return {
      title: {
        text: 'Напряжение и ток во времени',
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          const time = new Date(params[0].value[0]).toLocaleTimeString();
          let result = `Время: ${time}<br/>`;
          params.forEach((param) => {
            if (param.seriesType === 'line') {
              result += `${param.seriesName}: ${param.value[1].toFixed(2)} ${param.seriesName === 'Напряжение' ? 'В' : 'А'}<br/>`;
            }
          });
          return result;
        },
      },
      legend: { top: 30 },
      xAxis: {
        type: 'time',
        name: 'Время',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Напряжение (В)',
          position: 'left',
          axisLabel: { formatter: '{value} В' },
          splitLine: { show: false },
        },
        {
          type: 'value',
          name: 'Ток (А)',
          position: 'right',
          axisLabel: { formatter: '{value} А' },
        },
      ],
      series: [
        {
          name: 'Напряжение',
          type: 'line',
          yAxisIndex: 0,
          data: timeData.map((time, i) => [time, voltageData[i]]),
          itemStyle: { color: '#1890ff' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
          markArea:
            selectedPhase === 'all' && markAreas.length > 0
              ? {
                  data: markAreas,
                  silent: true,
                }
              : undefined,
        },
        {
          name: 'Ток',
          type: 'line',
          yAxisIndex: 1,
          data: timeData.map((time, i) => [time, currentData[i]]),
          itemStyle: { color: '#f5222d' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20 },
      ],
      grid: { top: 80, bottom: 80, left: 80, right: 80 },
    };
  }, [analysisData, phases, selectedPhase]);

  // 2. График накопленной емкости
  const capacityOption = useMemo(() => {
    const timeData = analysisData.map((d) => new Date(d.timestamp * 1000));
    const capacityData = analysisData.map((d) => d.ah);
    const maxCapacity = Math.max(...capacityData, 0);

    return {
      title: {
        text: 'Накопленная емкость',
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const time = new Date(params[0].value[0]).toLocaleTimeString();
          const capacity = params[0].value[1].toFixed(3);
          return `Время: ${time}<br/>Емкость: ${capacity} Ач`;
        },
      },
      xAxis: {
        type: 'time',
        name: 'Время',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'value',
        name: 'Емкость (Ач)',
        axisLabel: { formatter: '{value} Ач' },
      },
      series: [
        {
          name: 'Емкость',
          type: 'line',
          data: timeData.map((time, i) => [time, capacityData[i]]),
          itemStyle: { color: '#52c41a' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
                { offset: 1, color: 'rgba(82, 196, 26, 0.1)' },
              ],
            },
          },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
          markLine:
            maxCapacity > 0
              ? {
                  silent: true,
                  lineStyle: { color: '#faad14', type: 'dashed', width: 2 },
                  label: { position: 'end', formatter: '80%' },
                  data: [{ yAxis: maxCapacity * 0.8 }],
                }
              : undefined,
        },
      ],
      grid: { top: 60, bottom: 60, left: 80, right: 40 },
    };
  }, [analysisData]);

  // 3. Температурные характеристики
  const temperatureOption = useMemo(() => {
    const timeData = analysisData.map((d) => new Date(d.timestamp * 1000));
    const tempQ1Data = analysisData.map((d) => d.tempQ1);
    const tempAkbData = analysisData.map((d) => d.tempAkb);

    return {
      title: {
        text: 'Температурные характеристики',
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          const time = new Date(params[0].value[0]).toLocaleTimeString();
          let result = `Время: ${time}<br/>`;
          params.forEach((param) => {
            result += `${param.seriesName}: ${param.value[1]} °C<br/>`;
          });
          return result;
        },
      },
      legend: { top: 30 },
      xAxis: {
        type: 'time',
        name: 'Время',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: {
        type: 'value',
        name: 'Температура (°C)',
        axisLabel: { formatter: '{value} °C' },
      },
      series: [
        {
          name: 'Температура Q1',
          type: 'line',
          data: timeData.map((time, i) => [time, tempQ1Data[i]]),
          itemStyle: { color: '#fa8c16' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
        {
          name: 'Температура АКБ',
          type: 'line',
          data: timeData.map((time, i) => [time, tempAkbData[i]]),
          itemStyle: { color: '#722ed1' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
      ],
      grid: { top: 80, bottom: 60, left: 80, right: 40 },
    };
  }, [analysisData]);

  // 4. Расширенный график
  const extendedAnalysisOption = useMemo(() => {
    const timeData = analysisData.map((d) => new Date(d.timestamp * 1000));
    const voltageData = analysisData.map((d) => d.voltage);
    const currentData = analysisData.map((d) => d.current);
    const capacityData = analysisData.map((d) => d.ah);
    const tempQ1Data = analysisData.map((d) => d.tempQ1);
    const tempAkbData = analysisData.map((d) => d.tempAkb);
    const powerVoltageData = analysisData.map((d) => d.powerVoltage);

    const markAreas = [];
    if (selectedPhase === 'all') {
      phases.forEach((phase) => {
        if (phase.data.length > 0) {
          const startTime = new Date(phase.data[0].timestamp * 1000);
          const endTime = new Date(phase.data[phase.data.length - 1].timestamp * 1000);
          markAreas.push([
            {
              name: phase.label,
              xAxis: startTime,
              itemStyle: {
                color:
                  phase.type === 'charge'
                    ? 'rgba(82, 196, 26, 0.1)'
                    : phase.type === 'discharge'
                      ? 'rgba(245, 34, 45, 0.1)'
                      : 'rgba(250, 173, 20, 0.1)',
              },
            },
            {
              xAxis: endTime,
            },
          ]);
        }
      });
    }

    return {
      title: {
        left: 'center',
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function (params) {
          const time = new Date(params[0].value[0]).toLocaleTimeString();
          let result = `Время: ${time}<br/>`;

          params.forEach((param) => {
            if (param.seriesType === 'line') {
              let unit = '';
              let value = param.value[1];

              switch (param.seriesName) {
                case 'Напряжение АКБ':
                case 'Напряжение БП':
                  unit = 'В';
                  value = value.toFixed(2);
                  break;
                case 'Ток АКБ':
                  unit = 'А';
                  value = value.toFixed(2);
                  break;
                case 'Емкость':
                  unit = 'Ач';
                  value = value.toFixed(3);
                  break;
                case 'Температура Q1':
                case 'Температура АКБ':
                  unit = '°C';
                  value = value.toFixed(1);
                  break;
              }

              result += `${param.seriesName}: ${value} ${unit}<br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        top: 30,
        orient: 'horizontal',
        left: 'center',
      },
      xAxis: {
        type: 'time',
        name: 'Время',
        nameLocation: 'middle',
        nameGap: 30,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Напряжение (В)',
          position: 'left',
          axisLabel: { formatter: '{value} В' },
          splitLine: { show: true, lineStyle: { type: 'solid', opacity: 0.3 } },
        },
        {
          type: 'value',
          name: 'Ток (А)',
          position: 'right',
          axisLabel: { formatter: '{value} А' },
          splitLine: { show: false },
          offset: 5,
        },
        {
          type: 'value',
          name: 'Емкость (Ач)',
          position: 'right',
          axisLabel: { formatter: '{value} Ач' },
          splitLine: { show: false },
          offset: 80,
          nameGap: 15,
        },
        {
          type: 'value',
          name: 'Температура (°C)',
          position: 'right',
          axisLabel: { formatter: '{value} °C' },
          splitLine: { show: false },
          offset: 180,
          nameGap: 15,
        },
      ],
      series: [
        {
          name: 'Напряжение АКБ',
          type: 'line',
          yAxisIndex: 0,
          data: timeData.map((time, i) => [time, voltageData[i]]),
          itemStyle: { color: '#1890ff' },
          lineStyle: { width: 3 },
          smooth: true,
          symbol: 'none',
          emphasis: { lineStyle: { width: 4 } },
          markArea:
            selectedPhase === 'all' && markAreas.length > 0
              ? {
                  data: markAreas,
                  silent: true,
                }
              : undefined,
        },
        {
          name: 'Ток АКБ',
          type: 'line',
          yAxisIndex: 1,
          data: timeData.map((time, i) => [time, currentData[i]]),
          itemStyle: { color: '#f5222d' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
        {
          name: 'Емкость',
          type: 'line',
          yAxisIndex: 2,
          data: timeData.map((time, i) => [time, capacityData[i]]),
          itemStyle: { color: '#52c41a' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
        {
          name: 'Температура Q1',
          type: 'line',
          yAxisIndex: 3,
          data: timeData.map((time, i) => [time, tempQ1Data[i]]),
          itemStyle: { color: '#fa8c16' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
        {
          name: 'Температура АКБ',
          type: 'line',
          yAxisIndex: 3,
          data: timeData.map((time, i) => [time, tempAkbData[i]]),
          itemStyle: { color: '#722ed1' },
          lineStyle: { width: 2 },
          smooth: true,
          symbol: 'none',
        },
        {
          name: 'Напряжение БП',
          type: 'line',
          yAxisIndex: 0,
          data: timeData.map((time, i) => [time, powerVoltageData[i]]),
          itemStyle: { color: '#13c2c2' },
          lineStyle: { width: 2, type: 'dashed' },
          smooth: true,
          symbol: 'none',
        },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: 0 },
        { type: 'slider', xAxisIndex: 0, bottom: 10, height: 20 },
      ],
      grid: {
        top: 80,
        bottom: 80,
        left: 80,
        right: 235,
      },
    };
  }, [analysisData, phases, selectedPhase]);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.grid, ...styles.gridCols1 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Напряжение и ток во времени</h3>
          <ReactECharts option={voltageCurrentOption} style={{ height: '400px' }} />
        </div>
      </div>

      <div style={{ ...styles.grid, ...styles.gridCols2 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Накопленная емкость</h3>
          <ReactECharts option={capacityOption} style={{ height: '350px' }} />
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Температурные характеристики</h3>
          <ReactECharts option={temperatureOption} style={{ height: '350px' }} />
        </div>
      </div>

      <div style={{ ...styles.grid, ...styles.gridCols1 }}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Общий</h3>
          <ReactECharts option={extendedAnalysisOption} style={{ height: '500px' }} />
        </div>
      </div>
    </div>
  );
};

export default BatteryCharts;
