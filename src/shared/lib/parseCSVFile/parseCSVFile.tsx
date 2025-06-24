import { type DescriptionsProps, Typography } from 'antd';
const { Text } = Typography;

export interface CSVDataPoint {
  timestamp: number;
  voltage: number;
  current: number;
  ah: number;
  powerVoltage: number;
  tempQ1: number;
  tempAkb: number;
}

export interface Phase {
  type: 'discharge' | 'rest' | 'charge';
  startIndex: number;
  endIndex: number;
  duration: number;
  data: CSVDataPoint[];
  label: string;
}

interface ChargeSummary {
  totalTime: string;
  initialVoltage: string;
  finalVoltage: string;
  maxCurrent: string;
  minCurrent: string;
  accumulatedCapacity: string;
  averagePower: string;
}

interface PowerQuality {
  averagePowerVoltage: string;
  powerRipple: string;
  powerStability: string;
  maxDeviation: string;
}

interface Efficiency {
  chargeRate: string;
  cycleEnergy: string;
  ccPhaseEfficiency: string;
  ccCurrentUniformity: string;
  time80Percent: string;
}

interface CalculatedParams {
  internalResistance: string;
  cRate: string;
  energyDensity: string;
}

interface PhaseData {
  key: number;
  phase: string;
  time: string;
  voltage: string;
  current: string;
  cycle: string;
}

interface ThermalData {
  key: number;
  name: string;
  start: string;
  max: string;
  growth: string;
}

interface PhaseSummaryData {
  key: number;
  type: string;
  duration: string;
  startTime: string;
  endTime: string;
  points: number;
  avgCurrent: string;
  voltageRange: string;
}

// Парсинг CSV строки в массив объектов
function parseCSV(csvContent: string | unknown): CSVDataPoint[] {
  if (!csvContent || typeof csvContent !== 'string') return [];

  const lines = csvContent.trim().split('\n');
  const data: CSVDataPoint[] = [];

  for (const line of lines) {
    if (!line || !line.trim()) continue;

    const parts = line.split(';').map((part) => part.trim().replace(/[\r\n]/g, ''));
    if (parts.length < 7) continue;

    const [timestamp, voltage, current, ah, powerVoltage, tempQ1, tempAkb] = parts;

    // Заменяем запятые на точки для корректного парсинга чисел
    const voltageNum = voltage ? parseFloat(voltage?.replace(',', '.')) : 0;
    const currentNum = current ? parseFloat(current.replace(',', '.')) : 0;
    const ahNum = ah ? parseFloat(ah.replace(',', '.')) : 0;
    const powerVoltageNum = powerVoltage ? parseFloat(powerVoltage.replace(',', '.')) : 0;
    const tempQ1Num = tempQ1 ? parseInt(tempQ1) : 0;
    const tempAkbNum = tempAkb ? parseInt(tempAkb) : 0;

    data.push({
      timestamp: timestamp ? parseInt(timestamp) : 0,
      voltage: isNaN(voltageNum) ? 0 : voltageNum,
      current: isNaN(currentNum) ? 0 : currentNum,
      ah: isNaN(ahNum) ? 0 : ahNum,
      powerVoltage: isNaN(powerVoltageNum) ? 0 : powerVoltageNum,
      tempQ1: isNaN(tempQ1Num) ? 0 : tempQ1Num,
      tempAkb: isNaN(tempAkbNum) ? 0 : tempAkbNum,
    });
  }

  // Исключить нулевые записи и дубликаты
  return data
    .filter((point) => point.timestamp > 0)
    .filter((point, index, arr) => index === 0 || point.timestamp !== arr[index - 1]?.timestamp);
}

// Автоматическое определение фаз работы
function detectPhases(data: CSVDataPoint[]): Phase[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const phases: Phase[] = [];
  let currentPhase: 'discharge' | 'rest' | 'charge' | null = null;
  let phaseStartIndex = 0;

  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    let detectedPhase: 'discharge' | 'rest' | 'charge';

    if (point?.current && point.current < -0.01) {
      detectedPhase = 'discharge';
    } else if (point?.current && point.current > 0.01) {
      detectedPhase = 'charge';
    } else {
      detectedPhase = 'rest';
    }

    if (currentPhase !== detectedPhase) {
      if (currentPhase !== null && i > phaseStartIndex + 3) {
        const phaseData = data.slice(phaseStartIndex, i);
        if (phaseData.length > 0) {
          const first = phaseData[0];
          const last = phaseData[phaseData.length - 1];
          if (first?.timestamp != null && last?.timestamp != null) {
            phases.push({
              type: currentPhase,
              startIndex: phaseStartIndex,
              endIndex: i - 1,
              duration: last.timestamp - first.timestamp,
              data: phaseData,
              label: getPhaseLabel(currentPhase),
            });
          }
        }
      }

      currentPhase = detectedPhase;
      phaseStartIndex = i;
    }
  }

  if (currentPhase !== null && data.length > phaseStartIndex) {
    const phaseData = data.slice(phaseStartIndex);
    if (phaseData.length > 0) {
      const first = phaseData[0];
      const last = phaseData[phaseData.length - 1];
      if (first?.timestamp != null && last?.timestamp != null) {
        phases.push({
          type: currentPhase,
          startIndex: phaseStartIndex,
          endIndex: data.length - 1,
          duration: last.timestamp - first.timestamp,
          data: phaseData,
          label: getPhaseLabel(currentPhase),
        });
      }
    }
  }

  return phases;
}

// Получение метки для фазы
function getPhaseLabel(phaseType: 'discharge' | 'rest' | 'charge'): string {
  const labels = {
    discharge: '🔋 Разряд',
    rest: '⏸️ Покой',
    charge: '⚡ Заряд',
  };
  return labels[phaseType];
}

// Форматирование времени
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} ч ${minutes} м`;
  }
  return `${minutes} м`;
}

// Форматирование даты и времени
function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Создание сводки по фазам
function createPhasesSummary(phases: Phase[]): PhaseSummaryData[] {
  return phases.map((phase, index) => {
    const currents = phase.data.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
    const voltages = phase.data.map((p) => p.voltage).filter((v) => isFinite(v));

    const avgCurrent = currents.length > 0 ? currents.reduce((sum, c) => sum + c, 0) / currents.length : 0;

    const minVoltage = voltages.length > 0 ? Math.min(...voltages) : 0;
    const maxVoltage = voltages.length > 0 ? Math.max(...voltages) : 0;

    return {
      key: index,
      type: phase.label,
      duration: formatTime(phase.duration),
      startTime: formatDateTime(phase.data[0]?.timestamp || 0),
      endTime: formatDateTime(phase.data[phase.data.length - 1]?.timestamp || 0),
      points: phase.data.length,
      avgCurrent: phase.type === 'rest' ? '~0 А' : `${avgCurrent.toFixed(2)} А`,
      voltageRange: `${minVoltage.toFixed(1)} - ${maxVoltage.toFixed(1)} В`,
    };
  });
}

// Сводка цикла заряда
function calculateChargeSummary(data: CSVDataPoint[]): { data: ChargeSummary; component: DescriptionsProps['items'] } {
  if (!Array.isArray(data) || data.length === 0) {
    return { data: {} as ChargeSummary, component: [] };
  }

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  if (!firstPoint || !lastPoint) {
    return { data: {} as ChargeSummary, component: [] };
  }

  // Общее время заряда
  const totalTimeSeconds = lastPoint.timestamp - firstPoint.timestamp;

  // Начальное и конечное напряжение
  const initialVoltage = firstPoint.voltage;
  const finalVoltage = lastPoint.voltage;

  // Максимальный и минимальный ток
  const currents = data.map((p) => Math.abs(p.current)).filter((c) => c > 0 && isFinite(c));
  const maxCurrent = currents.length > 0 ? Math.max(...currents) : 0;
  const minCurrent = currents.length > 0 ? Math.min(...currents) : 0;

  // Накопленная емкость
  const capacities = data.map((p) => p.ah).filter((ah) => isFinite(ah));
  const accumulatedCapacity = capacities.length > 0 ? Math.max(...capacities) : 0;

  // Средняя мощность
  const powers = data.map((p) => Math.abs(p.voltage * p.current)).filter((p) => p > 0 && isFinite(p));
  const averagePower = powers.length > 0 ? powers.reduce((sum, p) => sum + p, 0) / powers.length : 0;

  const result: ChargeSummary = {
    totalTime: formatTime(totalTimeSeconds),
    initialVoltage: initialVoltage.toFixed(2),
    finalVoltage: finalVoltage.toFixed(2),
    maxCurrent: maxCurrent.toFixed(2),
    minCurrent: minCurrent.toFixed(2),
    accumulatedCapacity: accumulatedCapacity.toFixed(3),
    averagePower: averagePower.toFixed(1),
  };

  return {
    data: result,
    component: [
      {
        key: '1',
        span: 3,
        label: 'Общее время',
        children: <Text>{result.totalTime}</Text>,
      },
      {
        key: '2',
        span: 3,
        label: 'Начальное напряжение',
        children: <Text>{result.initialVoltage} В</Text>,
      },
      {
        key: '3',
        span: 3,
        label: 'Конечное напряжение',
        children: <Text>{result.finalVoltage} В</Text>,
      },
      {
        key: '4',
        span: 3,
        label: 'Максимальный ток',
        children: <Text>{result.maxCurrent} A</Text>,
      },
      {
        key: '5',
        span: 3,
        label: 'Минимальный ток',
        children: <Text>{result.minCurrent} A</Text>,
      },
      {
        key: '6',
        span: 3,
        label: 'Накопленная емкость',
        children: <Text>{result.accumulatedCapacity} Ач</Text>,
      },
      {
        key: '7',
        span: 3,
        label: 'Средняя мощность',
        children: <Text>{result.averagePower} Вт</Text>,
      },
    ],
  };
}

// Качество питания
function calculatePowerQuality(data: CSVDataPoint[]): { data: PowerQuality; component: DescriptionsProps['items'] } {
  const powerVoltages = data.map((p) => p.powerVoltage).filter((v) => v > 0 && isFinite(v));

  if (powerVoltages.length === 0) {
    const result: PowerQuality = {
      averagePowerVoltage: '0',
      powerRipple: '0',
      powerStability: '0',
      maxDeviation: '0',
    };
    return { data: result, component: [] };
  }

  const averagePowerVoltage = powerVoltages.reduce((sum, v) => sum + v, 0) / powerVoltages.length;

  // Расчет стандартного отклонения для пульсаций
  const variance = powerVoltages.reduce((sum, v) => sum + Math.pow(v - averagePowerVoltage, 2), 0) / powerVoltages.length;
  const standardDeviation = Math.sqrt(Math.max(0, variance));

  const maxVoltage = Math.max(...powerVoltages);
  const minVoltage = Math.min(...powerVoltages);
  const maxDeviation = Math.max(maxVoltage - averagePowerVoltage, averagePowerVoltage - minVoltage);

  const stability = averagePowerVoltage > 0 ? ((averagePowerVoltage - standardDeviation) / averagePowerVoltage) * 100 : 0;

  const result: PowerQuality = {
    averagePowerVoltage: averagePowerVoltage.toFixed(2),
    powerRipple: (standardDeviation * 1000).toFixed(0),
    powerStability: Math.max(0, stability).toFixed(1),
    maxDeviation: (maxDeviation * 1000).toFixed(0),
  };

  return {
    data: result,
    component: [
      {
        key: '1',
        span: 3,
        label: 'Напряжение БП среднее',
        children: <Text>{result.averagePowerVoltage} В</Text>,
      },
      {
        key: '2',
        span: 3,
        label: 'Пульсации БП',
        children: <Text>&plusmn; {result.powerRipple} мВ</Text>,
      },
      {
        key: '3',
        span: 3,
        label: 'Стабильность БП',
        children: <Text>{result.powerStability} %</Text>,
      },
      {
        key: '4',
        span: 3,
        label: 'Максимальное отклонение',
        children: <Text>{result.maxDeviation} мВ</Text>,
      },
    ],
  };
}

// Эффективность
function calculateEfficiency(data: CSVDataPoint[]): { data: Efficiency; component: DescriptionsProps['items'] } {
  if (!Array.isArray(data) || data.length === 0) return { data: {} as Efficiency, component: [] };

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  if (!firstPoint || !lastPoint) return { data: {} as Efficiency, component: [] };

  const totalTimeHours = (lastPoint.timestamp - firstPoint.timestamp) / 3600;

  const capacities = data.map((p) => p.ah).filter((ah) => isFinite(ah));
  const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : 0;
  const chargeRate = totalTimeHours > 0 ? maxCapacity / totalTimeHours : 0;

  // Энергия цикла (численное интегрирование)
  let cycleEnergy = 0;
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    if (!current || !previous) continue;

    const dt = (current.timestamp - previous.timestamp) / 3600; // в часах
    const power = Math.abs(current.voltage * current.current);
    if (isFinite(power) && isFinite(dt)) {
      cycleEnergy += power * dt;
    }
  }

  // CC фаза с относительно постоянным током
  const currents = data.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
  const maxCurrent = currents.length > 0 ? Math.max(...currents) : 0;
  const ccThreshold = maxCurrent * 0.7; // Повышаем порог для более точного определения CC

  const ccPhaseData = data.filter((p) => Math.abs(p.current) > ccThreshold);
  const ccPhaseEfficiency = data.length > 0 ? (ccPhaseData.length / data.length) * 100 : 0;

  // Равномерность тока в CC фазе
  const ccCurrents = ccPhaseData.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
  const ccAvgCurrent = ccCurrents.length > 0 ? ccCurrents.reduce((sum, c) => sum + c, 0) / ccCurrents.length : 0;
  const ccCurrentVariance =
    ccCurrents.length > 0 ? ccCurrents.reduce((sum, c) => sum + Math.pow(c - ccAvgCurrent, 2), 0) / ccCurrents.length : 0;
  const ccCurrentUniformity = ccAvgCurrent > 0 ? (Math.sqrt(Math.max(0, ccCurrentVariance)) / ccAvgCurrent) * 100 : 0;

  // Время 80% заряда
  const capacity80 = maxCapacity * 0.8;
  const time80Index = data.findIndex((p) => p.ah >= capacity80);
  const time80Seconds = (() => {
    const point = data[time80Index];
    return time80Index > 0 && point ? point.timestamp - firstPoint.timestamp : 0;
  })();

  const result: Efficiency = {
    chargeRate: chargeRate.toFixed(3),
    cycleEnergy: cycleEnergy.toFixed(1),
    ccPhaseEfficiency: ccPhaseEfficiency.toFixed(0),
    ccCurrentUniformity: ccCurrentUniformity.toFixed(0),
    time80Percent: formatTime(time80Seconds),
  };

  return {
    data: result,
    component: [
      {
        key: '1',
        span: 3,
        label: 'Скорость заряда',
        children: <Text>{result.chargeRate} Ач/ч</Text>,
      },
      {
        key: '2',
        span: 3,
        label: 'Энергия цикла',
        children: <Text>{result.cycleEnergy} Втч</Text>,
      },
      {
        key: '3',
        span: 3,
        label: 'КПД фазы CC',
        children: <Text>{result.ccPhaseEfficiency} %</Text>,
      },
      {
        key: '4',
        span: 3,
        label: 'Равномерность тока CC',
        children: <Text>&plusmn; {result.ccCurrentUniformity} %</Text>,
      },
      {
        key: '5',
        span: 3,
        label: 'Время 80% заряда',
        children: <Text>{result.time80Percent}</Text>,
      },
    ],
  };
}

// Расчетные параметры
function calculateParams(data: CSVDataPoint[]): { data: CalculatedParams; component: DescriptionsProps['items'] } {
  if (!Array.isArray(data) || data.length === 0) return { data: {} as CalculatedParams, component: [] };

  // Внутреннее сопротивление (приближенный расчет)
  const voltages = data.map((p) => p.voltage).filter((v) => isFinite(v));
  const currents = data.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));

  const voltageRange = voltages.length > 0 ? Math.max(...voltages) - Math.min(...voltages) : 0;
  const currentRange = currents.length > 0 ? Math.max(...currents) - Math.min(...currents) : 0;
  const internalResistance = currentRange > 0.1 ? voltageRange / currentRange : 0;

  // C-рейт (приблизительно, исходя из максимального тока и емкости)
  const maxCurrent = currents.length > 0 ? Math.max(...currents) : 0;
  const capacities = data.map((p) => p.ah).filter((ah) => isFinite(ah));
  const maxCapacity = capacities.length > 0 ? Math.max(...capacities) : 0;
  const cRate = maxCapacity > 0 ? maxCurrent / maxCapacity : 0;

  // Энергетическая плотность
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  if (!firstPoint || !lastPoint) return { data: {} as CalculatedParams, component: [] };

  const totalTimeHours = (lastPoint.timestamp - firstPoint.timestamp) / 3600;
  let totalEnergy = 0;
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = data[i - 1];
    if (!current || !previous) continue;

    const dt = (current.timestamp - previous.timestamp) / 3600;
    const power = Math.abs(current.voltage * current.current);
    if (isFinite(power) && isFinite(dt)) {
      totalEnergy += power * dt;
    }
  }
  const energyDensity = totalTimeHours > 0 ? totalEnergy / totalTimeHours : 0;

  const result: CalculatedParams = {
    internalResistance: internalResistance.toFixed(2),
    cRate: cRate.toFixed(1),
    energyDensity: energyDensity.toFixed(1),
  };

  return {
    data: result,
    component: [
      {
        key: '1',
        span: 3,
        label: 'Внутреннее сопротивление',
        children: <Text>~ {result.internalResistance} &Omega; (&Delta;U / &Delta;I)</Text>,
      },
      {
        key: '2',
        span: 3,
        label: 'C-рейт заряда',
        children: <Text>{result.cRate} C (I / Ёмкость)</Text>,
      },
      {
        key: '3',
        span: 3,
        label: 'Энергетическая плотность',
        children: <Text>{result.energyDensity} Вт (Wh / Время)</Text>,
      },
    ],
  };
}

// Фазы заряда (для конкретной фазы заряда)
function calculatePhases(data: CSVDataPoint[]): PhaseData[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  if (!firstPoint || !lastPoint) return [];

  const totalTime = lastPoint.timestamp - firstPoint.timestamp;

  // CC фаза (постоянный ток) - ток выше 70% от максимального
  const currents = data.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
  const maxCurrent = currents.length > 0 ? Math.max(...currents) : 0;
  const ccThreshold = maxCurrent * 0.7; // Повышаем порог

  let ccStartIndex = data.findIndex((p) => Math.abs(p.current) > ccThreshold);
  let ccEndIndex = data.length - 1;

  // Защита от -1
  if (ccStartIndex === -1) ccStartIndex = 0;

  // Конец CC фазы (когда ток начинает существенно падать)
  for (let i = ccStartIndex; i < data.length - 1; i++) {
    const point = data[i];
    if (!point) continue;
    if (Math.abs(point.current) < ccThreshold) {
      ccEndIndex = i;
      break;
    }
  }

  const ccTime = (() => {
    const startPoint = data[ccStartIndex];
    const endPoint = data[ccEndIndex];
    return ccEndIndex > ccStartIndex && startPoint && endPoint ? endPoint.timestamp - startPoint.timestamp : 0;
  })();
  const cvTime = totalTime - ccTime;

  const ccVoltageStart = (() => {
    const point = data[ccStartIndex];
    return ccStartIndex >= 0 && point ? point.voltage : 0;
  })();
  const ccVoltageEnd = (() => {
    const point = data[ccEndIndex];
    return ccEndIndex < data.length && point ? point.voltage : 0;
  })();

  const cvSlice = data.slice(ccEndIndex);
  const cvVoltages = cvSlice.map((p) => p.voltage).filter((v) => isFinite(v));
  const cvVoltageAvg = cvVoltages.length > 0 ? cvVoltages.reduce((sum, p) => sum + p, 0) / cvVoltages.length : 0;

  const ccSlice = data.slice(ccStartIndex, ccEndIndex);
  const ccCurrentData = ccSlice.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
  const ccCurrentAvg = ccCurrentData.length > 0 ? ccCurrentData.reduce((sum, p) => sum + p, 0) / ccCurrentData.length : 0;

  const cvCurrentStart = (() => {
    const point = data[ccEndIndex];
    return ccEndIndex < data.length && point ? Math.abs(point.current) : 0;
  })();
  const cvCurrentEnd = Math.abs(lastPoint.current);

  return [
    {
      key: 1,
      phase: 'CC (постоянный ток)',
      time: formatTime(ccTime),
      voltage: `${ccVoltageStart.toFixed(2)} → ${ccVoltageEnd.toFixed(1)} В`,
      current: `~ ${ccCurrentAvg.toFixed(2)} А`,
      cycle: `${totalTime > 0 ? ((ccTime / totalTime) * 100).toFixed(0) : '0'} %`,
    },
    {
      key: 2,
      phase: 'CV (постоянное напряжение)',
      time: formatTime(cvTime),
      voltage: `~ ${cvVoltageAvg.toFixed(2)} В`,
      current: `${cvCurrentStart.toFixed(2)} → ${cvCurrentEnd.toFixed(2)} А`,
      cycle: `${totalTime > 0 ? ((cvTime / totalTime) * 100).toFixed(0) : '0'} %`,
    },
  ];
}

// Тепловые характеристики
function calculateThermalCharacteristics(data: CSVDataPoint[]): ThermalData[] {
  if (!Array.isArray(data) || data.length === 0) return [];

  const tempQ1Values = data.map((p) => p.tempQ1).filter((t) => t > 0 && isFinite(t));
  const tempAkbValues = data.map((p) => p.tempAkb).filter((t) => t > 0 && isFinite(t));

  const tempQ1Start = tempQ1Values.length > 0 ? Math.min(...tempQ1Values) : 0;
  const tempQ1Max = tempQ1Values.length > 0 ? Math.max(...tempQ1Values) : 0;
  const tempQ1Growth = tempQ1Max - tempQ1Start;

  const tempAkbStart = tempAkbValues.length > 0 ? Math.min(...tempAkbValues) : 0;
  const tempAkbMax = tempAkbValues.length > 0 ? Math.max(...tempAkbValues) : 0;

  // Нагрев на ампер
  const currents = data.map((p) => Math.abs(p.current)).filter((c) => isFinite(c));
  const maxCurrent = currents.length > 0 ? Math.max(...currents) : 0;
  const heatPerAmp = maxCurrent > 0 ? tempQ1Growth / maxCurrent : 0;

  return [
    {
      key: 1,
      name: 'Температура Q1',
      start: `${tempQ1Start} °C`,
      max: `${tempQ1Max} °C`,
      growth: `+${tempQ1Growth} °C`,
    },
    {
      key: 2,
      name: 'Температура АКБ',
      start: tempAkbValues.length > 0 ? `${tempAkbStart} °C` : '0 °C',
      max: tempAkbValues.length > 0 ? `${tempAkbMax} °C` : '0 °C',
      growth: tempAkbValues.length > 0 ? `+${tempAkbMax - tempAkbStart} °C` : 'нет датчика',
    },
    {
      key: 3,
      name: 'Нагрев/Ампер',
      start: '–',
      max: heatPerAmp > 0 ? `${heatPerAmp.toFixed(1)} °C/А` : '–',
      growth: '–',
    },
  ];
}

export const parseCSVFile = (csvContent: string, selectedPhase?: 'all' | number) => {
  const allData = parseCSV(csvContent);
  const phases = detectPhases(allData);

  // Определяем данные для анализа в зависимости от выбранной фазы
  let dataToAnalyze = allData;
  if (selectedPhase !== 'all' && typeof selectedPhase === 'number' && phases[selectedPhase]) {
    dataToAnalyze = phases[selectedPhase].data;
  }

  return {
    phases,
    phasesSummary: createPhasesSummary(phases),
    chargeSummary: calculateChargeSummary(dataToAnalyze),
    powerQuality: calculatePowerQuality(dataToAnalyze),
    efficiency: calculateEfficiency(dataToAnalyze),
    calculatedParams: calculateParams(dataToAnalyze),
    ccCvPhases: calculatePhases(dataToAnalyze),
    thermalCharacteristics: calculateThermalCharacteristics(dataToAnalyze),
  };
};
