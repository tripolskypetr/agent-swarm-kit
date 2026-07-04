# Учёт проверки файлов ./src на баги

Контекст: в рабочем дереве обновлены мажорные версии зависимостей (functools-kit 3→4,
worker-testbed 2→3). До исправлений тест-сьют падал 39/42 (зависание с 4-го теста).
Текущее состояние: 42/42, `npx tsc --noEmit` чисто, сборка ок.

## Найденные и исправленные баги

### 1. Дедлок waitForOutput при functools-kit v4 (причина 39 упавших тестов)
Файл: `src/client/ClientSwarm.ts`
- `waitForOutput` был обёрнут в `queued()`. Вложенный `execute` из инструмента ставит
  своего ожидателя вывода в очередь и подписывается на Subject'ы уже ПОСЛЕ эмита вывода —
  такой ожидатель виснет навсегда (выводы не буферизуются).
- В functools-kit v3 `queued` имел баг: `finally` сбрасывал цепочку даже при живых
  ожидающих вызовах, и новые вызовы «проскакивали» мимо зависшего. В v4 очередь стала
  строго последовательной — зависший ожидатель блокировал все последующие `complete`.
- Полностью параллельные ожидатели тоже не подходят: ломается попарное соответствие
  «ожидатель ↔ вывод» (все хватают первый эмит; тест server-side emit даёт max=100 вместо 200).
- Исправление: локальная FIFO-цепочка `_lastOutputAwaiter` с v3-семантикой — ожидатели
  запускаются по очереди, но при завершении запущенного ожидателя цепочка сбрасывается.

### 2. PersistBase принимал tmp-файлы атомарной записи за документы
Файлы: `src/classes/Persist.ts`, `src/utils/writeFileAtomic.ts`
- `keys()/values()/getCount()/removeAll()` матчили любые `*.json`, включая `.tmp-*.json`
  от `writeFileAtomic` — недописанный/осиротевший tmp-файл считался сущностью.
- Исправление: префикс вынесен в `TMP_FILE_PREFIX`, все сканы фильтруют tmp-файлы;
  при `waitForInit` удаляются осиротевшие tmp-файлы старше 2 минут (порог защищает
  «живые» записи параллельных процессов).

### 3. OperatorSignal.dispose вызывал null вместо функции
Файл: `src/client/ClientOperator.ts` (строки 60-64)
- `this._disposeRef = null; await this._disposeRef();` — ссылка обнулялась ДО вызова,
  каждый dispose после sendMessage кидал TypeError (срабатывает по таймауту оператора
  90с, в commitAgentChange и dispose).
- Исправление: ссылка сохраняется в локальную переменную до обнуления.

### 4. History: getSystemPrompt терялся в ветке onRead без filterCondition
Файл: `src/classes/History.ts`
- В `HistoryPersistInstance.iterate` и `HistoryMemoryInstance.iterate` (прототипные
  версии) ветка с колбэком `onRead` завершалась до выдачи system-подсказок из
  `getSystemPrompt`, тогда как версия с `filterCondition` их выдаёт. Комбинация
  onRead + getSystemPrompt молча теряла системные промпты.
- Исправление: блок getSystemPrompt добавлен в обе onRead-ветки (симметрично filtered-версии).

### 5. SharedCompute.getComputeData — неверная сигнатура type-cast
Файл: `src/classes/SharedCompute.ts` (строка 66)
- Реализация принимает `(computeName)`, а cast объявлял `(clientId, computeName)` —
  копипаста из Compute.ts. TS-пользователь передал бы clientId первым аргументом,
  и он попал бы в `validate` как имя compute.
- Исправление: cast приведён к `(computeName: ComputeName) => Promise<T>`.

### 6. ClientAgent.mapMcpToolCall — разыменование отсутствующего inputSchema
Файл: `src/client/ClientAgent.ts` (строка 198)
- `mcpProperties` вычислялся с защитой от отсутствующего `inputSchema`, но строкой ниже
  `inputSchema.required` разыменовывался без защиты — MCP-инструмент без inputSchema
  ронял процесс TypeError'ом.
- Исправление: `inputSchema?.required`.

## Полностью прочитано (багов не найдено, если не указано иное)
utils: isObject, msToTime (JSDoc≠код: msToTime(0)→"00:00:00.0", не runtime-баг),
nameToTitle, objectFlat, removeXmlTags (JSDoc≠код: удаляет теги С содержимым — намеренно),
createToolRequest, writeFileAtomic ✏️, resolveTools, beginContext
helpers: mapCompletionSchema, removeUndefined, toJsonSchema, mapAgentSchema
validation: validateNoToolCall, validateDefault, validateNoEmptyResult, validateToolArguments
classes: RoundRobin, Chat, Schema, Storage, State, SharedState, SharedStorage, Compute,
SharedCompute ✏️, Policy, MCP, Operator, Adapter, History ✏️, Persist ✏️ (760-1060 построчно,
1060-1845 скимом — шаблонные Persist*Utils)
client: ClientSwarm ✏️, ClientSession, ClientAgent ✏️ (весь файл), ClientStorage,
ClientState, ClientPolicy, ClientHistory, ClientMCP, ClientCompute, ClientOperator ✏️
functions/navigate: changeToAgent, changeToPrevAgent, changeToDefaultAgent
functions/target: execute, session, complete, makeConnection, makeAutoDispose, fork(scope.ts), json
functions/common: validate
functions/history: getLastUserMessage
functions/commit: commitToolOutput (остальные — тот же шаблон, скимом)
template: createCommitAction, createFetchInfo, createNavigateToAgent, createNavigateToTriageAgent
lib/services: BusService, PerfService, ExecutionValidationService, NavigationValidationService,
SessionValidationService

## Частично прочитано / скимом
- src/lib/services/validation/* — все memoized `validate` проверены на возврат значения
  (важно для v4 memoize: undefined-результат теперь кэшируется); все возвращают `true as never`
- src/lib/services/connection/{Agent,Session,Swarm}ConnectionService — скимом паттерны
  memoize/dispose/clear, консистентны; dispose-тесты проходят
- src/index.ts, src/config/params.ts, src/classes/Logger.ts — только grep

## Не проверено (по остаточному принципу: шаблонный код или типы)
- src/lib/services/{public,schema,meta,context}/*, base/{DocService,LoggerService,AliveService}
- src/functions/{alias,dump,setup,test,event,other}/*, остальные commit/history/target
- src/events/* (16 одинаковых queued-обёрток), src/cli/*, src/contract/*, src/model/*,
  src/interfaces/* (типы), src/config/*
- Аудит всех использований `queued()` по grep: кроме waitForOutput все оборачивают
  завершающиеся функции — строгий FIFO v4 корректен

## Проверки
- `npx tsc --noEmit` — чисто
- `npm run build` — ок (types.d.ts перегенерирован)
- `node ./test/index.mjs` — 42/42 после каждого исправления (5 прогонов суммарно)
