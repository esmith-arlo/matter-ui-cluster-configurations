# Test Scripts

Этот каталог содержит скрипты для тестирования и сравнения результатов генерации capabilities между Python и JavaScript реализациями.

## Скрипты

### 1. `generate_capabilities_js.js` (JavaScript)

Генерирует JSON capabilities из XML файла кластера в том же формате, что и Python скрипт.

**Использование:**
```bash
node TestScripts/generate_capabilities_js.js <xml_file> <output_json_file>
```

**Пример:**
```bash
node TestScripts/generate_capabilities_js.js data/clusters/OnOff.xml output/onoff_js.json
```

### 2. `compare_capabilities.js`

Сравнивает два JSON файла, сгенерированные Python и JavaScript скриптами.

**Использование:**
```bash
node TestScripts/compare_capabilities.js <python_json> <javascript_json> [output_diff_file]
```

**Пример:**
```bash
node TestScripts/compare_capabilities.js output/onoff_python.json output/onoff_js.json output/diff.json
```

### 3. `run_comparison.sh`

Запускает оба генератора (Python и JavaScript) для одного кластера и сравнивает результаты.

**Использование:**
```bash
./TestScripts/run_comparison.sh <cluster_xml_file>
```

**Пример:**
```bash
./TestScripts/run_comparison.sh data/clusters/OnOff.xml
```

### 4. `run_all_comparisons.sh`

Запускает сравнения для всех кластеров или кластеров, соответствующих паттерну.

**Использование:**
```bash
./TestScripts/run_all_comparisons.sh [cluster_pattern]
```

**Примеры:**
```bash
# Все кластеры
./TestScripts/run_all_comparisons.sh

# Только OnOff
./TestScripts/run_all_comparisons.sh OnOff

# Несколько кластеров
./TestScripts/run_all_comparisons.sh "OnOff|LevelControl"
```

## Требования

- Python 3.6+
- Node.js 14.0+
- npm (для установки зависимостей)

## Установка зависимостей

Установите зависимости для тестовых скриптов:

```bash
cd TestScripts
npm install
```

Или из корня проекта:

```bash
cd TestScripts && npm install && cd ..
```

## Примеры использования

### Генерация capabilities для одного кластера

```bash
# Python
python3 scripts/generate_matter_cluster_json.py data/clusters/OnOff.xml output/onoff_python.json

# JavaScript
node TestScripts/generate_capabilities_js.js data/clusters/OnOff.xml output/onoff_js.json

# Сравнение
node TestScripts/compare_capabilities.js output/onoff_python.json output/onoff_js.json
```

### Автоматическое сравнение

```bash
# Один кластер
./TestScripts/run_comparison.sh data/clusters/OnOff.xml

# Все кластеры
./TestScripts/run_all_comparisons.sh
```

## Формат выходных данных

Оба генератора создают JSON файлы в следующем формате:

```json
{
  "id": "com.matter.cluster.onoff",
  "clusterId": "0x0006",
  "name": "On/Off",
  "schemaVersion": 1,
  "description": "Matter On/Off Cluster",
  "xmlSource": "data/clusters/OnOff.xml",
  "Capabilities": {
    "Attributes": {...},
    "Commands": {...},
    "Features": {...}
  }
}
```

## Результаты тестирования

При последнем запуске тестов:
- **Всего кластеров**: 107
- **Успешно**: 96 (89.7%)
- **Провалились**: 11 (10.3%)

## Устранение проблем

### Ошибка: Cannot find module '@xmldom/xmldom'

Установите зависимости:
```bash
npm install
```

### Ошибка: Permission denied

Сделайте скрипты исполняемыми:
```bash
chmod +x TestScripts/*.sh
chmod +x TestScripts/*.js
```

### Различия в результатах

Если скрипты генерируют разные результаты:
1. Проверьте файл diff для деталей
2. Убедитесь, что оба скрипта используют одну и ту же версию XML файла
3. Проверьте логи в `/tmp/comparison_*.log`
