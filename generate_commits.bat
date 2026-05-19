@echo off
setlocal enabledelayedexpansion

:: Get current commit count
for /f "tokens=*" %%a in ('git rev-list --count HEAD') do set "COUNT=%%a"
echo Current commit count: !COUNT!

set TARGET=505
if !COUNT! geq !TARGET! (
    echo Already have 505 or more commits.
    exit /b 0
)

set /a NEEDED=!TARGET!-!COUNT!
echo Generating !NEEDED! commits...

for /l %%i in (1, 1, !NEEDED!) do (
    set /a CURRENT=!COUNT!+%%i
    echo Commit !CURRENT! at %date% %time% >> commit_count.txt
    git add commit_count.txt
    git commit -m "chore: increment commit count [!CURRENT!]" >nul
    if %%i %% 50 == 0 echo Generated %%i/!NEEDED! commits...
)

echo Done!
for /f "tokens=*" %%a in ('git rev-list --count HEAD') do set "FINAL_COUNT=%%a"
echo Final commit count: !FINAL_COUNT!
