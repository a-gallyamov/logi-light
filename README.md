# Logi Light Monitoring

Demo: [https://a-gallyamov.github.io/logi-light/](https://a-gallyamov.github.io/logi-light/)

Light версия приложения для анализа и мониторинга данных `csv` выгрузки из зарядного устройства `ViktoRi`.

### Возможности
- Импорт CSV файлов с данными от `Loger_ViktoRi`
- Открытие нескольких вкладок с графиками
- Автоматическое определение фаз: заряд, разряд, покой
- Расчет показателей эффективности: C-рейт, энергетическая плотность, внутреннее сопротивление
- Анализ качества питания: пульсации, стабильность, отклонения
- Тепловой мониторинг: температура Q1 и АКБ, нагрев на ампер

### Поддерживаемые данные

Приложение обрабатывает CSV файлы со следующими полями:
- `timestamp` - временная метка (Unix timestamp)
- `voltage` - напряжение батареи (В)
- `current` - ток батареи (А)
- `ah` - накопленная емкость (Ач)
- `powerVoltage` - напряжение блока питания (В)
- `tempQ1` - температура Q1 (°C)
- `tempAkb` - температура АКБ (°C)

### Автоматическое определение фаз
- Фаза заряда (ток > 0.01А)
- Фаза разряда (ток < -0.01А)
- Фаза покоя (|ток| ≤ 0.01А)

### Расчетные параметры
- **CC/CV анализ**: Constant Current / Constant Voltage фазы
- **Эффективность заряда**: скорость, энергия цикла, равномерность тока
- **Качество питания**: пульсации, стабильность БП
- **Тепловые характеристики**: динамика температур, нагрев на ампер

MIT License
