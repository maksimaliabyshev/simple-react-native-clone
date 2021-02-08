# simple-react-native-clone

Массовое клонирование проекта на основе react-native, для поддержки однотипных приложений.

## Требуемые утилиты
node
```
brew install node
```
yarn
```
brew install yarn
```

## Установка
Производится в корень базового проекта react-native 
```
yarn add simple-react-native-clone
```
Нужно создать конфигурационный файл рядом с package.json 
```
./clone.config.js
```
Базовый пример конфигурации [clone.config.js](./clone.config.js)

## Запуск
В package.json добавить скрипты быстрого запуска

```
"scripts": {
    "clone": "simple-rn-clone clone",
    "build": "simple-rn-clone build"
}
```
Клонировать базовый проект для всех конфигураций клонов
```
yarn clone
```  
Клонировать базовый проект для одной конфигурации клона по имени `name`
```
yarn clone "name"
yarn clone name     // имя без пробелов
```  
Собрать проект для всех конфигурации клонов
```
yarn build
```  
Собрать проект для одной конфигурации по имени `name`
```
yarn build "name"
yarn build name     // имя без пробелов
```  
Дополнительные опции запуска `-i`-ios  `-a`-android  

```
yarn build -a         // собрать всё, только под платформу android
yarn build name -i    // собрать один клон под платформу ios 
yarn build -ia        // подготовить для сборки, но не собирать   
```

## Настройка
Указать данные базового проекта, с которого будет производится клонирование.     
```
base: {
        folder: '../rn_starter',    //относительное расположение папки проекта 
        name: 'rn_starter',         //его текущее имя  
        package: 'com.rn_starter',  //имя package
    },
```

Настройка массива клонов
```
clone: [
    {
        folder: '../rn_starter_company',    // относительное расположение папки клона 
        name: 'New AppName',                // новое имя проекта и displayName 
        package: 'com.rn_starter.company',  // изменить имя package
        },
        .....
]
```

При клонировании исключить эти данные, согласно [шаблону](https://linuxize.com/post/how-to-exclude-files-and-directories-with-rsync/) `rsync -av --exclude=PATTERN` 
```
exclude: [
    'clone.config.js',
    'node_modules',
    'npm*',
    '.git',
    '.history',
    .....
]
```
### Копирование
Копирование файлов или каталогов в каждый клон. Пути задаются относительные. Нужно писать пути так как это бы работало для базового проекта.
Переменная `${clone.nameProject}` будет заменена именем клона,
если у клона имя "New AppName", то переменная `clone.nameProject=NewAppName`,
Значит в базовом проекте должна быть папка 
`./ios/rn_starter/Images_NewAppName.xcassets`, которая заменит в клоне папку 
`./ios/rn_starter/Images.xcassets`

> Все копируемые файлы или папки попадают в `exclude`, что бы в клоне не было лишних данных. Т.е. в клоне будут только те данные, которые для него и предназначались.                 

```
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

Такой же принцип работы копирования и для каждого отдельного клона, если нужно применить копирование не для всех, а только для отдельного. 
```
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
    .....
]
```
Правила копирования основаны на модуле [copy-dir](https://www.npmjs.com/package/copy-dir)

### Замена

Замена строк внутри файлов или всех файлов в целевом каталоге, для всех клонов. 
```
replace_global: [
    {
        files: './android/app/build.gradle',       // целевой файл или папка для изменения
        from: '/(applicationId\\s*")(.+)(")/giu',  // RegExp для поиска
        to: ['$1${clone.package}$3'],              // на что заменить
    },
],
```
Правила замены основаны на модуле [replace-in-file
](https://www.npmjs.com/package/replace-in-file) 
Точно так же это работает и для конкретного клона.

### Сборка всех клонов

Последовательно выполняются команды для каждого клона, их можно менять под свои задачи.  
```
build_ios: ['npx react-native run-ios --configuration "Release"'],
build_android: [
    'cd ./android',
    'pwd',
    // './gradlew cleanBuildCache',
    './gradlew assembleRelease',
],
```