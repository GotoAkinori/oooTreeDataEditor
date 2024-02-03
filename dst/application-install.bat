rem <For Users>
rem   Please execute this file.

rem <For Developers>
rem   1. Make <name>.json
rem   2. Copy this .bat file and <name>.json
rem   3. Change "name" value to your application name.

rem ---------------
set name=oootree
rem ---------------

cd /d %~dp0
set target_file=%OOO_LOCAL_SERVER_HOME%\config\applications\%name%.json
del %target_file%

setlocal enabledelayedexpansion
for /f "delims=" %%A in (.\%name%.json) do (
    set line=%%A
    set line=!line:{dir}=%CD%!
    set line=!line:\=\\!
    echo !line!>>%target_file%
)
endlocal

