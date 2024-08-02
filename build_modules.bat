copy .\react_front\build\static\js\main.*.js .\bga\modules\main.js
"C:\Program Files\nodejs\terser" --compress ecma=2015 --mangle --keep-fnames .\bga\modules\game_ui.js -o .\bga\modules\game_ui.min.js