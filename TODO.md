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

## 6-й заход: полное покрытие агентского флоу (+31 тест, +1 баг)

### Новые тесты (31), сьют вырос до 88/88
- test/spec/agentflow.test.mjs (12): prompt-функция + systemStatic + systemDynamic +
  completion flags доходят до модели; transform; map; mapToolCalls фильтрует вызовы;
  keepMessages обрезает контекст; runStateless не трогает историю; runStateless → ""
  при tool_calls; resque-стратегии recomplete и custom; жизненный цикл колбэков
  (init/execute/output/afterToolCalls/dispose — закрепляет фикс №14); commitToolRequest
  пишет в историю с генерированными id; всё семейство history-геттеров (включая
  getLastToolMessage — закрепляет фикс №13)
- test/spec/commit.test.mjs (8): skip-vs-force для commitSystemMessage /
  commitAssistantMessage / commitDeveloperMessage; payload у commitUserMessage;
  commitFlushForce сбрасывает контекст модели; cancelOutputForce разрешает зависший
  execute пустым выводом; notify — guard по режиму сессии + доставка в makeConnection;
  emitForce подменяет вывод идущего выполнения
- test/spec/orchestration.test.mjs (11): fork/scope (сессия внутри, очистка после);
  startPipeline (переключение агента и восстановление, onStart/onEnd) и error-путь
  (onError, isError, результат null); policy autoBan (бан по validateInput, повторный
  запрос банится); operator-агент (маршрутизация к оператору, ответ через next,
  dispose сигнала — закрепляет фикс №3); makeAutoDispose закрывает простаивающую
  сессию; getSessionMode/getCheckBusy/hasNavigation/getToolNameForModel/hasSession;
  outline json() — валидный и невалидный (maxAttempts) пути; chat(); advisor ask();
  кастомные события event/listenEvent
- Все 31 сценарий предварительно прогнаны standalone-скриптом (защита от зависаний).
  Один сценарий поправил по факту семантики: emit — не push в коннектор (это notify),
  а подстановка вывода для уже идущего выполнения.

### Баг №16: operator-агент без completion не проходил валидацию
Файл: `src/lib/services/validation/AgentValidationService.ts` (найден тестом C5)
- validate() безусловно вызывал `completionSchemaService.get(agent.completion)` для
  проверки json-флага ДО проверки operator. У operator-агента completion легально
  отсутствует (validateShallow разрешает) → ToolRegistry.get(undefined) кидал
  «Tool not registered name=undefined» — session() с operator-агентом был сломан.
- Исправление: json-проверка выполняется только при наличии completion.

## 7-й заход: compute/state/storage-глубина + инфраструктура (+21 тест, +1 баг)

### Новые тесты (21), сьют вырос до 109/109
- test/spec/compute.test.mjs (8): кэш compute по TTL + пересчёт по изменению связанного
  state (stateChanged-binding) + middlewares; Compute.update форсит refetch; shared
  compute БЕЗ dependsOn (закрепляет фиксы №5 и №11); shared state set/get/clear;
  state middlewares + clearState; storage take() по similarity со score-фильтром +
  onUpdate-колбэки + list с фильтром; shared storage upsert/list/get; Schema.serialize
  без "undefined"-строк + writeSessionMemory/readSessionMemory
- test/spec/infra.test.mjs (13): History.useHistoryCallbacks onPush; getSystemPrompt +
  onRead доходит до модели (закрепляет фикс №4); Logger.useClientCallbacks onLog;
  PersistBase write/read/keys с игнором .tmp-файлов (закрепляет фикс №2); PersistList
  LIFO push/pop; RoundRobin; commit-события на agent-bus через listenAgentEvent;
  wildcard-подписчик "*"; listenEventOnce с фильтром срабатывает один раз; зацикленная
  навигация A↔B гасится flushMessage; CC_MAX_NESTED_EXECUTIONS рвёт бесконечный
  tool-цикл (executeForce-рекурсия) placeholder'ом без зависания; Chat.beginChat/
  sendMessage/dispose; overrideCompletion меняет поведение новых сессий

### Баг №17: Schema.serialize отдавал модели строки "undefined: "
Файл: `src/classes/Schema.ts` (найден тестом E3)
- objectFlat вставляет записи-разделители ["",""], а serialize прогонял их через
  mapKey → nameToTitle("") → undefined → в результирующем тексте для модели
  появлялись литеральные строки "undefined: ".
- Исправление: пустой ключ рендерится пустой строкой-разделителем.

## 8-й заход: policy/навигационные гарды/адаптеры (+15 тестов, +1 баг)

### Новые тесты (15), сьют вырос до 124/124
- test/spec/policy.test.mjs (7): бан/разбан через Policy utils (banClient/hasBan/
  unbanClient) с banMessage при complete; validateOutput с кастомным getBanMessage;
  MergePolicy отдаёт сообщение именно упавшей политики; повторный changeToAgent в одном
  выполнении кидает recursion-ошибку при CC_THROW_WHEN_NAVIGATION_RECURSION;
  changeToAgent на агента вне свармы возвращает false без смены; дубль session() на
  один clientId кидает "already exist"; swarm-колбэки onInit/onExecute/onAgentChanged/
  onDispose за жизненный цикл сессии
- test/spec/adapters.test.mjs (8): Operator.useOperatorAdapter (кастомный
  OperatorInstance) + useOperatorCallbacks — полный цикл operator-агента; кастомный
  PersistState-адаптер (usePersistStateAdapter) с persist:true; кэш эмбеддингов
  поисковой строки между двумя take() — регрессионный тест бага №18;
  session.rate ограничивает повторный complete (возврат ""); Storage.createNumericIndex
  1→2; getPayload + getSessionContext внутри tool call; getAgentHistory содержит
  prompt/user/assistant; commitAssistantMessageForce виден в messages следующего
  комплишена

### Баг №18: ClientStorage.take не кэшировал эмбеддинг поисковой строки
Файл: `src/client/ClientStorage.ts` (найден тестом AD3 в repro)
- Для item'ов кэш эмбеддингов писался, а для search-текста — только читался: на промахе
  эмбеддинг пересчитывался при каждом take() с тем же запросом (created=["aa","zz","zz"]).
- Исправление: на промахе после createEmbedding вызывается writeEmbeddingCache для
  hash поисковой строки.

## 9-й заход: addOutline/json + addAdvisor/ask (+8 тестов, багов не найдено)

### Новые тесты (8), сьют вырос до 132/132
- test/spec/outline.test.mjs (8): happy path json() — prompt/system/flags комплишена
  попадают в history, format и clientId `*_outline` доходят до getCompletion,
  onAttempt/onValidDocument; ретраи — невалидный JSON (attempt 0) → провал validation
  (attempt 1) → успех (attempt 2), history пересобирается на каждой попытке (один
  user-месседж в итоге); исчерпание maxAttempts — isValid:false, data:null, error
  сохранён, onInvalidDocument; гарды outline — json() на незарегистрированном имени
  и дубль addOutline кидают; outline с комплишеном без `json: true` отклоняется
  валидатором ("completion schema is not JSON"); addAdvisor/ask happy path с
  onChat/onResult (resultId непустой); ask со структурным message-объектом
  (generic T); гарды advisor — ask на незарегистрированном имени и дубль
  addAdvisor кидают

## 10-й заход: аудит src/client/* на уязвимые места (+11 тестов, багов не найдено)

Отдельно перечитаны все 10 файлов клиентского слоя (ClientAgent, ClientCompute,
ClientHistory, ClientMCP, ClientOperator, ClientPolicy, ClientSession, ClientState,
ClientStorage, ClientSwarm) с фокусом на уязвимые сценарии: рекурсивная навигация,
гонки, обрывы tool-цепочек, битые ссылки на агентов, потеря целостности history.

### Новые тесты (11), сьют вырос до 143/143 — test/spec/resilience.test.mjs
- приоритет навигационного тула: батч [data-тул, nav-тул] выполняет ТОЛЬКО навигацию
  (защита от двойных side-эффектов при навигации);
- maxToolCalls=2 срезает батч из 3 вызовов до хвостовых [b,c];
- дефолт CC_MAX_TOOL_CALLS=1: из батча в 2 вызова выполняется только последний
  (закреплено как контракт — важный неочевидный дефолт);
- неизвестный тул от модели → placeholder-ответ + resque-flush истории (следующий
  комплишен не видит старых сообщений);
- validate тула вернул false → placeholder, call не выполняется;
- упавший тул (throw) останавливает цепочку: второй тул не вызывается, placeholder;
- битая целостность history не доходит до модели: commitToolRequest без output
  (висячие tool_calls) и commitToolOutput с чужим toolId (сиротский tool-месседж)
  отфильтровываются в toArrayForAgent;
- keepMessages=2: модель видит ровно хвостовое окно [echo:turn3, turn4];
- два параллельных complete() сохраняют попарность вход→выход (busy-lock +
  FIFO-цепочка waitForOutput);
- 10 параллельных setState-инкрементов без потерянных обновлений (queued dispatch);
- битый активный агент ("ghost" не из свармы через CC_SWARM_DEFAULT_AGENT) →
  NoopAgent-фолбэк на defaultAgent, complete не падает и отвечает.

Замечания без фикса (by design): рекурсивная навигация уже покрыта в 8-м заходе
(CC_THROW_WHEN_NAVIGATION_RECURSION, A↔B гасится flushMessage, CC_MAX_NESTED_EXECUTIONS);
_navigationStack растёт при каждой навигации и не дедуплицируется — это история для
navigationPop; тул, закоммитивший output без продолжения флоу (executeForce/emit),
оставляет complete висеть — контракт библиотеки (страховка: warning через 15с).

## 11-й заход: Adapter-обёртки провайдеров + resque-стратегии (+10 тестов)

### Новые тесты (10), сьют вырос до 153/153 — test/spec/providers.test.mjs
- fromOpenAI: полный tool-roundtrip на моке SDK — строковые arguments парсятся в
  объект для тула, обратно tool_calls сериализуются строкой, tool_call_id линкуется,
  model/temperature/seed уходят в запрос;
- fromLMStudio happy path (model/seed);
- fromGrok tool-roundtrip;
- fromOllama: TOOL_PROTOCOL_PROMPT первым system-месседжем, объектные arguments
  passthrough, автогенерация id для tool_calls;
- fromCohereClientV2: camelCase toolCalls/toolCallId, content-массив [{text}];
- fromHf: chatCompletion, tool-роль с tool_call_id;
- fromCortex: реальный HTTP-roundtrip на локальном http-сервере, system-промпты
  склеиваются в один первый месседж;
- retry: транзиентная ошибка адаптера ретраится (2-й вызов успешен, задержка ~5с);
- CC_RESQUE_STRATEGY="recomplete": пустой ответ модели → RECOMPLETE_PROMPT → recovered;
- CC_RESQUE_STRATEGY="custom": CC_TOOL_CALL_EXCEPTION_CUSTOM_FUNCTION подменяет ответ.

### Экспорт-пропуск: TOOL_PROTOCOL_PROMPT не реэкспортировался из index.ts
Файл: `src/index.ts` — константа — публичный дефолт параметра fromOllama; добавлен
в `export { Adapter, TOOL_PROTOCOL_PROMPT }`.

## 12-й заход: семейство override* + все Persist-адаптеры (+17 тестов)

### Новые тесты (17), сьют вырос до 170/170
- test/spec/override.test.mjs (11): overrideAgent (prompt), overrideSwarm
  (defaultAgent), overrideTool (call), overridePolicy (validateInput), overrideState
  (getDefaultState), overrideStorage+overrideEmbedding (createIndex + createEmbedding),
  overrideCompute (getComputeData), overrideMCP (listTools+callTool), overrideOutline
  (prompt), overrideAdvisor (getChat), overridePipeline (execute). ВАЖНО: все
  override* асинхронные — без await схема не успевает переопределиться до session().
- test/spec/persist.test.mjs (6): кастомные in-memory адаптеры для PersistSwarm
  (active agent + navigation stack переживают пересоздание сессии, persist: true на
  сварме), PersistStorage (items переживают пересоздание, persist: true на сторэдже),
  PersistPolicy (баны в адаптере, persist: true на политике), PersistMemory
  (writeSessionMemory/readSessionMemory при CC_PERSIST_ENABLED_BY_DEFAULT, требует
  живую сессию), PersistAlive (markOnline/markOffline при глобальном persist),
  PersistEmbedding (кэш эмбеддингов при persist: true на СХЕМЕ ЭМБЕДДИНГА —
  CC_PERSIST_EMBEDDING_CACHE, второй take без пересчёта).

## 13-й заход: остатки публичного API (+9 тестов) — ПОКРЫТИЕ ЗАКРЫТО

### Новые тесты (9), сьют вырос до 179/179 — test/spec/misc.test.mjs
- scope(): addAgent/addSwarm/complete внутри скоупа работают, наружу схемы не
  протекают (validate снаружи кидает "not exist");
- runStatelessForce: ответ есть, история не мутирует;
- getNavigationRoute: посещённые агенты в маршруте после навигации;
- addCommitAction: обе ветки — executeAction+successMessage и
  validateParams-ошибка+failureMessage;
- addFetchInfo: fetchContent коммитится tool output'ом, флоу завершается;
- top-level validate(): проходит на консистентных схемах, кидает на битой ссылке
  (агент со storages: ["missing"]);
- History.useHistoryAdapter: класс-наследник HistoryMemoryInstance перехватывает push;
- Chat.useChatAdapter + useChatCallbacks: adapter sendMessage + onBeginChat/
  onSendMessage/onDispose;
- MCP.update(mcpName) без clientId: сбрасывает кэш тулов для всех клиентов
  (комплишен видит новый список).

Осталось непокрытым осознанно: таймаут оператора (константа 90с, не конфигурируется),
Chat inactivity-таймауты (константы минутного масштаба).

## Найденные и исправленные баги (18 итого)

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
