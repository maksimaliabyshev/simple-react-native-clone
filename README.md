# simple-react-native-clone

Bulk cloning of a react-native based project to support similar applications. Language [🇺🇸](./README.md) / [<img src="https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_the_Russian_Soviet_Federative_Socialist_Republic_%281954%E2%80%931991%29.svg" width="24"/>](./README_ru-RU.md)

## Required

node

```bash
brew install node
```

yarn

```bash
brew install yarn
```

## Installation

Produced at the root of the react-native base project

```bash
yarn add simple-react-native-clone --dev
```

You need to create a config file next to package.json

```bash
./clone.config.js
```

Basic configuration example [clone.config.js](./clone.config.js)

## Launch

Add quick start scripts to package.json

```json
"scripts": {
    "clone": "simple-rn-clone clone",
    "build": "simple-rn-clone build"
}
```

Clone base project for all clone configurations

```bash
yarn clone
```

Clone base project for one clone configuration named `name`

```bash
yarn clone "name"
yarn clone name     // name without spaces
```

Build project for all clone configuration

```bash
yarn build
```

Build a project for one configuration named `name`

```bash
yarn build "name"
yarn build name     // name without spaces
```

Additional launch options `-i`-ios `-a`-android

```bash
yarn build -a         // collect everything, only for the android platform
yarn build name -i    // build one clone for the ios platform
yarn build -ia        // prepare for build, but not build
```

## Settings

Specify the data of the base project from which the cloning will be performed.

```js
base: {
        folder: '../rn_starter',    // the relative location of the project folder
        name: 'rn_starter',         // his current name
        package: 'com.rn_starter',  // package name
},
```

Setting up an array of clones

```js
clone: [
    {
        folder: '../rn_starter_company',    // the relative location of the clone folder
        name: 'New AppName',                // new project name and displayName
        package: 'com.rn_starter.company',  // change package name
    },
    //.....
],
```

When cloning, exclude this data, according to [template](https://linuxize.com/post/how-to-exclude-files-and-directories-with-rsync/) `rsync -av --exclude=PATTERN`

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

### Copying

Copy files or directories to each clone. The paths are set relative. You need to write the paths as it would work for the base project.
The variable `${clone.nameProject}` will be replaced with the name of the clone,
if the clone has the name "New AppName", then the variable `clone.nameProject=NewAppName`,
This means that the base project must have a folder
`./ios/rn_starter/Images_NewAppName.xcassets`, which will replace the folder in the clone
`./ios/rn_starter/Images.xcassets`

> All copied files or folders are included in `exclude`, so that there is no extra data in the clone. Those. the clone will contain only the data that was intended for it.

⚠️ Copying the .git folder from the base project is prohibited by default, each new clone creates its own repository.

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

The same principle of copying works for each individual clone, if you need to apply copying not for everyone, but only for a particular case.

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

Copy rules are implemented by the module [copy-dir](https://www.npmjs.com/package/copy-dir)

### Replacement

Replacing lines within files or all files in the target directory, for all clones.

```js
replace_global: [
    {
        files: './android/app/build.gradle',       // target file or folder to change
        from: '/(applicationId\\s*")(.+)(")/giu',  // RegExp for search
        to: ['$1${clone.package}$3'],              // what to replace
    },
],
```

Replacement rules are implemented by the module [replace-in-file
](https://www.npmjs.com/package/replace-in-file)
It works the same way for a specific clone.

### Build all clones

The commands for each clone are sequentially executed, they can be changed for your tasks.

```js
build_ios: ['npx react-native run-ios --configuration "Release"'],
build_android: [
    'cd ./android',
    'pwd',
    // './gradlew cleanBuildCache',
    './gradlew assembleRelease',
],
```
