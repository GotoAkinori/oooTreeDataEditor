rem <For Users>
rem   Drop file on this file.

rem <For Developers>
rem   1. Change "name" value to your application name.

rem ---------------
set name=ooo_tree
rem ---------------

node.exe %OOO_LOCAL_SERVER_HOME_BIN% -f "%1" -a %name%
