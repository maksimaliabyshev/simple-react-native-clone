[![npm](https://img.shields.io/npm/v/simple-react-native-clone)](https://www.npmjs.com/package/simple-react-native-clone) ![npm](https://img.shields.io/npm/dt/simple-react-native-clone?color=red&label=downloads) ![NPM](https://img.shields.io/npm/l/simple-react-native-clone)

# simple-react-native-clone

Массовое клонирование проекта на основе react-native, для поддержки однотипных приложений. Язык [English](./README.md) 

## Требуемые утилиты

node

```bash
brew install node
```

yarn

```bash
brew install yarn
```

## Установка

Производится в корень базового проекта react-native

```bash
yarn add simple-react-native-clone --dev
```

Нужно создать конфигурационный файл рядом с package.json

```bash
./clone.config.js
```

Базовый пример конфигурации [clone.config.js](./clone.config.js)

## Запуск

В package.json добавить скрипты быстрого запуска

```json
"scripts": {
    "clone": "simple-rn-clone clone",
    "build": "simple-rn-clone build"
}
```

Клонировать базовый проект для всех конфигураций клонов

```bash
yarn clone
```

Клонировать базовый проект для одной конфигурации клона по имени `name`

```bash
yarn clone "name"
yarn clone name     // имя без пробелов
```

Собрать проект для всех конфигурации клонов

```bash
yarn build
```

Собрать проект для одной конфигурации по имени `name`

```bash
yarn build "name"
yarn build name     // имя без пробелов
```

Дополнительные опции запуска `-i`-ios `-a`-android

```bash
yarn build -a         // собрать всё, только под платформу android
yarn build name -i    // собрать один клон под платформу ios
yarn build -ai        // подготовить для сборки, но не собирать
```

## Настройка

Указать данные базового проекта, с которого будет производится клонирование.

```js
base: {
        folder: '../rn_starter',    // относительное расположение папки проекта
        name: 'rn_starter',         // его текущее имя
        package: 'com.rn_starter',  // имя package
},
```

Настройка массива клонов

```js
clone: [
    {
        folder: '../rn_starter_company',    // относительное расположение папки клона
        name: 'New AppName',                // новое имя проекта и displayName
        package: 'com.rn_starter.company',  // изменить имя package
    },
    //.....
],
```

При клонировании исключить эти данные, согласно [шаблону](https://linuxize.com/post/how-to-exclude-files-and-directories-with-rsync/) `rsync -av --exclude=PATTERN`

```js
exclude: [
    'clone.config.js',
    'node_modules',
    'npm*',
    '.git',
    '.history',
    //.....
],
```

### Копирование

Копирование файлов или каталогов в каждый клон. Пути задаются относительные. Нужно писать пути так как это бы работало для базового проекта.
Переменная `${clone.nameProject}` будет заменена именем клона,
если у клона имя "New AppName", то переменная `clone.nameProject=NewAppName`,
Значит в базовом проекте должна быть папка
`./ios/rn_starter/Images_NewAppName.xcassets`, которая заменит в клоне папку
`./ios/rn_starter/Images.xcassets`

> Все копируемые файлы или папки попадают в `exclude`, что бы в клоне не было лишних данных. Т.е. в клоне будут только те данные, которые для него и предназначались.

⚠️ Копирование папки .git из базового проекта по умолчанию запрещено, в каждом новом клоне создаётся свой репозиторий.

```js
copy_global: [
    {
        from: './ios/rn_starter/Images_${clone.nameProject}.xcassets',
        to: './ios/rn_starter/Images.xcassets',
    },
    {
        from: './android/app/src/main/res_${clone.nameProject}',
        to: './android/app/src/main/res',
    },
],
```

Такой же принцип работы копирования и для каждого отдельного клона, если нужно применить копирование не для всех, а только для отдельного случая.

```js
clone: [
    {
        folder: '../rn_starter_company',
        name: 'New AppName',
        package: 'com.rn_starter.company',
        copy: [
           {
              from: './android/app/src/main/res_${clone.nameProject}',
              to: './android/app/src/main/res',
           },
        ],
    },
    //.....
],
```

Правила копирования реализованы модулем [copy-dir](https://www.npmjs.com/package/copy-dir)

### Замена

Замена строк внутри файлов или всех файлов в целевом каталоге, для всех клонов.

```js
replace_global: [
    {
        files: './android/app/build.gradle',       // целевой файл или папка для изменения
        from: '/(applicationId\\s*")(.+)(")/giu',  // RegExp для поиска
        to: ['$1${clone.package}$3'],              // на что заменить
    },
],
```

Правила замены реализованы модулем [replace-in-file
](https://www.npmjs.com/package/replace-in-file)
Точно так же это работает и для конкретного клона.

### Сборка всех клонов

Последовательно выполняются команды для каждого клона, их можно менять под свои задачи.

```js
build_ios: ['npx react-native run-ios --configuration "Release"'],
build_android: [
    'cd ./android',
    'pwd',
    // './gradlew cleanBuildCache',
    './gradlew assembleRelease',
],
```
