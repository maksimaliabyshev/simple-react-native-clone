const cloneConfig = {
    base: {
        folder: '../rn_starter',
        name: 'rn_starter',
        package: 'com.rn_starter',
    },
    options: {
        remove: false, // remove old cloned files, before new command clone
    },
    build_ios: ['npx react-native run-ios --configuration "Release"'],
    build_android: [
        'cd ./android',
        'pwd',
        // './gradlew cleanBuildCache',
        './gradlew assembleRelease',
    ],
    exclude: [
        'clone.config.js',
        'node_modules',
        'npm*',
        '.git',
        '.history',
        '.vscode',
        '.idea',
        '.expo',
        '.DS_Store',
        'ignite',
        'storybook',
        'buck-out',
        '.jsbundle',
        'bin/Exponent.app',
        'ios/Pods',
        'android/.gralde',
        'android/.idea',
        'android/app/build',
        'android/build',
        'web-build',
        'app/config/env.*.js',
    ],
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
    // replace_global: [
    //     {
    //         files: './android/app/build.gradle',
    //         from:
    //             '/(applicationId\\s*")(.+)(")/giu',
    //         to: ['$1${clone.package}$3'],
    //     },
    // ],
    clone: [
        {
            folder: '../rn_starter_company',
            name: 'New AppName',
            package: 'com.rn_starter.company',
            // copy: [
            //     {
            //         from: './android/app/src/main/res_${clone.nameProject}',
            //         to: './android/app/src/main/res',
            //     },
            // ],
        },
        {
            folder: '../rn_starter_company2',
            package: 'com.rn_starter.company2',
            name: 'New AppName 2',
            // copy: [
            //     {
            //         from:
            //             './android/app/src/main/res/playstore_${clone.nameProject}.png',
            //         to: './android/app/src/main/res/playstore.png',
            //     },
            // ],
            // replace: {
            //     files: './android/app/build.gradle',
            //     from: '/(applicationId\\s*")(.+)(")/giu',
            //     to: ['$1${clone.package}$3'],
            // },
        },
    ],
};

module.exports = cloneConfig;
