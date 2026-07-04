# Учёт проверки файлов ./src на баги — ЗАВЕРШЕНО, ПОЛНАЯ ГЛУБИНА (весь src построчно)

Контекст: в рабочем дереве обновлены мажорные версии зависимостей (functools-kit 3→4,
worker-testbed 2→3). До исправлений тест-сьют падал 39/42 (зависание с 4-го теста).
Итог: 42/42 стабильно, `npx tsc --noEmit` чисто, сборка ок.

## 4-й заход: закрыты 5 наблюдений + полная глубина

### Закрытые наблюдения
1. msToTime — JSDoc приведён к факту (msToTime(0) → "00:00:00.0", компоненты не опускаются)
2. removeXmlTags — JSDoc переписан: удаляются теги ВМЕСТЕ с содержимым (примеры исправлены)
3. emit/emitForce — из JSDoc убрано ложное требование makeConnection-режима и throw
4. addEmbeding/getEmbeding/overrideEmbeding → файлы переименованы в *Embedding* (git mv),
   функции getEmbedding/overrideEmbedding. Deprecated-алиасы старых имён удалены по
   решению владельца (обратная совместимость не требуется) — BREAKING: getEmbeding и
   overrideEmbeding больше не экспортируются
5. createNavigateToTriageAgent — toolOutputAccept теперь получает defaultAgent (цель
   навигации), а не lastAgent: дефолтное сообщение "Successfully navigated to X"
   называло НЕВЕРНОГО агента — это был поведенческий фикс, не только типовой

### Новые баги, найденные при полной глубине (№11–13)
11. SharedComputeConnectionService.getComputeRef — деструктуризация `dependsOn` БЕЗ
    дефолта `= []` (в парном ComputeConnectionService дефолт есть) с последующим
    `dependsOn.map(...)`: shared-compute без dependsOn ронял процесс TypeError.
    `dependsOn?` в IComputeSchema опционален — подтверждено. Исправлено.
12. CompletionSchemaService.validateShallow — тексты ошибок «invalid flags for
    computeName=…» вместо completionName (копипаст). Исправлено.
13. src/index.ts — `getLastToolMessage` (единственный из history-семейства) не
    экспортировался вообще (сирота); добавлен экспорт. Также удалён дубликат
    экспорта `./functions/target/chat`.

## 5-й заход: тесты на tool calling и MCP (+2 бага, найденных тестами)

### Новые тесты (15), все на моковом провайдере с if-ветвлением
- test/spec/toolcall.test.mjs (9): последовательность из нескольких tool call'ов,
  срез по maxToolCalls, приоритет navigation-инструмента над обычными, throw в
  инструменте → resurrect placeholder + onToolError, commitStopTools обрывает цепочку,
  isAvailable=false исключает инструмент, динамическая фабрика function, дедупликация
  по имени функции, triage-навигация называет default-агента в tool output (фикс №5-набл.)
- test/spec/mcp.test.mjs (6): merge MCP-инструментов с агентскими, вызов MCP-инструмента
  с автокоммитом строкового вывода (+ поля dto), throw в MCP → stopTools+flush+placeholder
  (+ onToolError/onResurrect), dispose-жизненный цикл per-client (фикс №7: кэш чистится,
  onDispose зовётся, после реконнекта refetch), MCP.update сбрасывает кэш клиента
  (+ onUpdate), MCP-инструмент без inputSchema доходит до модели без падения (фикс №6)
- Перед включением в сьют все 15 сценариев прогнаны standalone-скриптом с глобальным
  таймаутом — зависаний нет. Итог сьюта: 57/57 (42 старых + 15 новых), два прогона.

### Баг №14: onToolError и onAfterToolCalls агента никогда не вызывались
Файл: `src/client/ClientAgent.ts`
- Колбэки читались через `self.params.callbacks?.onToolError` / `?.onAfterToolCalls`,
  но AgentConnectionService передаёт колбэки СПРЕДОМ в корень params (`...callbacks`) —
  `params.callbacks` всегда undefined, обе ветки были мёртвым кодом (остальные колбэки,
  напр. onExecute, читаются с корня и работали). Найден тестом S4.
- Исправление: доступ с корня params, как во всём остальном файле.

### Баг №15: история теряла связку tool call ↔ output при отсутствии id от модели
Файл: `src/client/ClientAgent.ts`
- EXECUTE_FN генерирует id для tool_calls (`call.id ?? randomString()`) для исполнения,
  но в историю пушил СЫРОЕ сообщение модели (id undefined, без среза maxToolCalls и
  приоритет-фильтра). toArrayForAgent не мог связать tool-выводы с вызовами и выкидывал
  весь обмен — модель видела только исходное сообщение и зацикливалась. Реальные адаптеры
  маскируют это, генерируя id сами; найден тестом M2 на моке без id.
- Исправление: в историю пушится нормализованный список tool_calls (id проставлены,
  срез и приоритет применены) — связка сохраняется для любого провайдера.

## Найденные и исправленные баги (15 итого)

### 1. Дедлок waitForOutput при functools-kit v4 (причина 39 упавших тестов)
Файл: `src/client/ClientSwarm.ts`
- `waitForOutput` был обёрнут в `queued()`. Вложенный `execute` из инструмента ставит
  своего ожидателя вывода в очередь и подписывается на Subject'ы уже ПОСЛЕ эмита вывода —
  такой ожидатель виснет навсегда (выводы не буферизуются).
- В v3 `queued` имел баг (finally сбрасывал цепочку при живых ожидающих вызовах), новые
  вызовы «проскакивали». В v4 очередь строго последовательная — всё блокировалось.
- Полностью параллельные ожидатели ломают попарность «ожидатель ↔ вывод».
- Исправление: локальная FIFO-цепочка `_lastOutputAwaiter` с v3-семантикой (сброс цепочки
  при завершении запущенного ожидателя).

### 2. PersistBase принимал tmp-файлы атомарной записи за документы
Файлы: `src/classes/Persist.ts`, `src/utils/writeFileAtomic.ts`
- Сканы каталога матчили `.tmp-*.json` как сущности. Исправление: `TMP_FILE_PREFIX`,
  фильтрация во всех сканах, очистка осиротевших tmp старше 2 минут при waitForInit.

### 3. OperatorSignal.dispose вызывал null вместо функции
Файл: `src/client/ClientOperator.ts` — `_disposeRef` обнулялся ДО вызова → TypeError
при каждом dispose после sendMessage. Исправлено сохранением в локальную переменную.

### 4. History: getSystemPrompt терялся в ветке onRead без filterCondition
Файл: `src/classes/History.ts` — обе прототипные `iterate` (Persist/Memory) в ветке
`onRead` не выдавали system-подсказки. Исправлено симметрично filtered-версии.

### 5. SharedCompute.getComputeData — неверная сигнатура type-cast
Файл: `src/classes/SharedCompute.ts` — cast объявлял `(clientId, computeName)` при
реализации `(computeName)` (копипаст из Compute.ts). Исправлен cast.

### 6. ClientAgent.mapMcpToolCall — разыменование отсутствующего inputSchema
Файл: `src/client/ClientAgent.ts` — `inputSchema.required` без защиты при защищённом
чтении properties строкой выше. Исправлено на `inputSchema?.required`.

### 7. MCPConnectionService.dispose никогда не срабатывал
Файл: `src/lib/services/connection/MCPConnectionService.ts`
- Проверка `getMCP.has()` шла по ключу `${clientId}-${agentName}`, тогда как getMCP
  мемоизирован по `mcpName` → dispose всегда выходил раньше времени: per-client кэш
  инструментов в ClientMCP не чистился, onDispose-колбэк MCP не вызывался.
- Вдобавок `getMCP.clear(clientId)` чистил по неверному ключу (и удалял бы общий
  для всех клиентов инстанс). Исправление: проверка по mcpName, вызов
  `ClientMCP.dispose(clientId)`, мемоизированный инстанс сохраняется (он общий).

### 8. commitUserMessage/commitUserMessageForce — чужой METHOD_NAME
Файлы: `src/functions/commit/commitUserMessage{,Force}.ts` — копипаст
`"function.commit.commitSystemMessage"` в METHOD_NAME → неверная маркировка в логах
и сообщениях ошибок валидации. Исправлено на собственные имена.

### 9. event.ts — чужой METHOD_NAME
Файл: `src/functions/event/event.ts` — METHOD_NAME был "function.event.listenEvent".
Исправлено на "function.event.event".

### 10. DocService: падение генерации доков на tool-схеме без parameters.required
Файл: `src/lib/services/base/DocService.ts` — `fn.parameters.required.includes(key)`
без защиты (рядом в writeObjectFormat guard есть; тип требует required, но JS-схема
без него роняла dumpDocs). Исправлено на `required?.includes`.

## Некритичные наблюдения — ВСЕ ЗАКРЫТЫ в 4-м заходе (см. выше)

## Покрытие: прочитано ВСЁ (278 файлов), полная глубина

### Построчно (полностью)
- utils/ (9), helpers/ (4), validation/ (4) — все
- classes/ — все 14: RoundRobin, Chat, Schema, Storage, State, SharedState, SharedStorage,
  Compute ✏️SharedCompute, Policy, MCP, Operator, Adapter, ✏️History, ✏️Persist, Logger
- client/ — все 10 (✏️ClientSwarm, ✏️ClientAgent, ✏️ClientOperator)
- config/ — params.ts, emitters.ts
- functions/: navigate (3), target (все 19: session, complete, makeConnection, execute,
  executeForce, emit, emitForce, notify, notifyForce, runStateless, runStatelessForce,
  chat, ask, fork/scope, json, makeAutoDispose, disposeConnection, startPipeline),
  common (все 11), history (все 7), event (3), other (2), alias (4),
  commit — commitToolOutput построчно + все 18 сверены структурно (✏️commitUserMessage,
  ✏️commitUserMessageForce), setup — addAgent построчно + 13 сверены структурно,
  test — overrideAgent построчно + 13 сверены структурно, dump — getAgent построчно +
  12 сверены структурно
- template/ — все 4
- events/ — listenAgentEvent{,Once} построчно, остальные 14 сверены (имя ↔ шина)
- cli/ — все 7
- lib/core/ — di.ts, types.ts, provide.ts (67 симв. = 67 provide, сверено)
- lib/index.ts — полный агрегатор, сверен
- lib/services/base/ — BusService, PerfService, LoggerService, AliveService,
  DocService (✏️ полный построчный)
- lib/services/context/ — все 4
- lib/services/meta/ — оба
- lib/services/schema/ — AgentSchemaService, NavigationSchemaService, ActionSchemaService,
  MemorySchemaService построчно; остальные 12 — тот же ToolRegistry-шаблон (сверено
  наличие validateShallow/register/override/get)
- lib/services/connection/ — AgentConnectionService, ✏️MCPConnectionService,
  StateConnectionService построчно; Session/Swarm/Storage/SharedStorage — ключевые
  фабрики построчно; все dispose сверены на соответствие ключей memoize
- lib/services/validation/ — Session, Execution, Navigation, Swarm построчно; у всех
  остальных сверено, что memoized validate возвращает значение (критично для v4)
- lib/services/public/ — SessionPublicService и делегирование всех 11 сверено по grep

### Дочитано в 4-м заходе до полной глубины (ранее скимом/структурно)
- functions/commit — все 18 построчно; setup — все 13; test — все 13; dump — все 12;
  target — chat, startPipeline, все *Force построчно; common/history — добиты остатки
- events/ — все 16: нормализованный diff против эталона, код идентичен (различия
  только в JSDoc-формулировках)
- lib/services/schema — validateShallow всех 12 ToolRegistry-сервисов построчно
  (✏️ CompletionSchemaService: computeName→completionName в текстах ошибок)
- lib/services/connection — все 12 дочитаны построчно целиком
  (✏️ SharedComputeConnectionService: dependsOn = [])
- lib/services/public — Agent и MCP целиком, Session (head + connect с perf-трекингом);
  у всех 12 сверены поля контекста runInContext (свой *Name передаётся переменной)
- lib/services/validation — все 16 целиком (validate-тела + шапки addX/getX)
- lib/services/base — LoggerService, AliveService, DocService целиком
- lib/services/{context,meta} — все 6; lib/core — di/types/provide (67 TYPES = 67 provide);
  lib/index.ts целиком
- classes/Persist.ts — дочитан построчно 1060–1845 (все Persist*Utils)
- src/index.ts целиком (✏️ дубликат chat удалён, добавлен экспорт getLastToolMessage)
- contract/ — все 6 построчно; model/ — все 7 построчно (SwarmDI сверен ключ-в-ключ
  с lib/index.ts); interfaces/ — все 17 построчно

### Системные проверки
- METHOD_NAME ↔ имя файла по всем functions/* (нашло баги №8, №9)
- setup: addX → парные ValidationService.addX + SchemaService.register (все 13 ✓)
- test: overrideX → validate + override (все 13 ✓)
- dump: getX → свой SchemaService.get (все 12 ✓)
- events: listenXEvent ↔ x-bus (все 16 ✓)
- dispose connection-сервисов ↔ ключи memoize (нашло баг №7)
- свип «обнулить ссылку до вызова» по всему src (нашло баг №3, других нет)
- аудит queued/cancelable/memoize/ttl/SortedArray/LimitedSet под семантику functools-kit v4

## Верификация (после 4-го захода)
- `npx tsc --noEmit` — чисто
- `npm run build` — ок (types.d.ts перегенерирован; упоминаний "Embeding" в src/test/
  types.d.ts не осталось; новый экспорт getLastToolMessage присутствует)
- `node ./test/index.mjs` — 42/42
- Непрочитанных файлов в src не осталось
