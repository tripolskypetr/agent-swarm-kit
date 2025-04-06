@echo off
cd demo
for /d %%D in (*) do (
    if not "%%D"=="." if not "%%D"==".." (
        cd "%%D"
        echo %%D
        :: call bun install agent-swarm-kit
        call bun install
        call npm run build:docs
        cd ..
    )
)
