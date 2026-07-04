# Учёт проверки файлов ./src на баги

Контекст: в рабочем дереве обновлены мажорные версии зависимостей (functools-kit 3→4,
worker-testbed 2→3). До исправлений тест-сьют падал 39/42 (зависание с 4-го теста).
После исправлений: 42/42 в трёх прогонах подряд, `npx tsc --noEmit` чисто.

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
- Исправление: локальная FIFO-цепочка с v3-семантикой — ожидатели запускаются по очереди,
  но при завершении запущенного ожидателя цепочка сбрасывается, чтобы «опоздавший»
  висящий ожидатель не блокировал новых.

### 2. PersistBase принимал tmp-файлы атомарной записи за документы
Файлы: `src/classes/Persist.ts`, `src/utils/writeFileAtomic.ts`
- `keys()/values()/getCount()/removeAll()` матчили любые `*.json`, включая `.tmp-*.json`
  (временные файлы `writeFileAtomic` в том же каталоге). Недописанный или осиротевший
  tmp-файл попадал в выборку как сущность (наблюдалось в логах тестов:
  "PersistBase found invalid document for ... .tmp-...").
- Исправление: префикс вынесен в `TMP_FILE_PREFIX` (writeFileAtomic.ts), все сканы
  каталога фильтруют tmp-файлы; при инициализации (`waitForInit`) осиротевшие tmp-файлы
  старше 2 минут удаляются (возрастной порог — чтобы не удалить «живую» запись
  параллельного процесса).

## Полностью прочитано (багов не найдено, если не указано иное)
- src/utils/isObject.ts
- src/utils/msToTime.ts — JSDoc расходится с кодом (msToTime(0) даёт "00:00:00.0", а не ""), не runtime-баг
- src/utils/nameToTitle.ts
- src/utils/objectFlat.ts
- src/utils/removeXmlTags.ts — JSDoc расходится с кодом (удаляет теги ВМЕСТЕ с содержимым), поведение похоже на намеренное
- src/utils/createToolRequest.ts
- src/utils/writeFileAtomic.ts — ✏️ исправлен (экспорт TMP_FILE_PREFIX)
- src/utils/resolveTools.ts
- src/utils/beginContext.ts
- src/helpers/mapCompletionSchema.ts
- src/helpers/removeUndefined.ts
- src/helpers/toJsonSchema.ts
- src/helpers/mapAgentSchema.ts
- src/validation/validateNoToolCall.ts
- src/validation/validateDefault.ts
- src/validation/validateNoEmptyResult.ts
- src/validation/validateToolArguments.ts
- src/classes/RoundRobin.ts
- src/client/ClientSwarm.ts — ✏️ исправлен (баг №1)
- src/client/ClientSession.ts
- src/functions/navigate/changeToAgent.ts
- src/functions/navigate/changeToPrevAgent.ts
- src/functions/navigate/changeToDefaultAgent.ts
- src/functions/target/execute.ts

## Частично прочитано
- src/client/ClientAgent.ts — строки ~300–610 (EXECUTE_FN, tool-цикл), ~900–1010
  (_resurrectModel), фрагменты execute/run/waitForOutput/_emitOutput; багов не найдено
- src/classes/Persist.ts — строки 1–40, 176–350, 420–470, 548–660, 740–780 —
  ✏️ исправлен (баг №2)
- src/index.ts — только grep (экспорты)
- src/config/params.ts — только grep (setConfig, флаги логгера)
- src/classes/Logger.ts — только grep (useCommonAdapter)

## Не проверено (файлы читались только по необходимости; всего в src 278 файлов)
- src/classes/* кроме RoundRobin/Persist (History, Adapter, Storage, Chat, Policy, Compute, Schema, State, SharedState, SharedStorage, SharedCompute, MCP, Operator)
- src/client/* кроме ClientSwarm/ClientSession/ClientAgent (ClientStorage, ClientHistory, ClientCompute, ClientPolicy, ClientState, ClientMCP, ClientOperator)
- src/lib/services/* (base, public, connection, validation)
- src/functions/* кроме navigate/execute, src/events/*, src/template/*, src/cli/*, src/contract/*, src/model/*, src/interfaces/*
- Аудит остальных ~35 использований `queued()` по grep: все оборачивают функции,
  которые гарантированно завершаются (state dispatch, обработчики событий, session
  complete и т.п.) — строгий FIFO functools-kit v4 для них корректен.

## Проверки
- `npx tsc --noEmit` — чисто
- `npm run build` — ок (обновился и сгенерированный types.d.ts)
- `node ./test/index.mjs` — 42/42, три прогона подряд без падений
