#!/usr/bin/env node

const program = require('commander');
const { join, resolve } = require('path');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const chalk = require('chalk');
const shell = require('shelljs');
const exec = shell.exec;
const figlet = require('figlet');
const os = require('os');
const simpleGit = require('simple-git');
const copydir = require('copy-dir');
const replace = require('replace-in-file');
const copyNodeModules = require('copy-node-modules');
const package = require('./package.json');
// const cloneConfig = require(process.cwd() +'./clone.config.js');
// const cloneConfig = require('./clone.config.js');
const cloneConfig = config_require('clone.config.js');

const exit = process.exit;
const error = (...message) =>
    console.error(
        chalk.black.bgRed('  Error:  '),
        chalk.red.bgBlack(' ', ...message, ' '),
    );
const warn = (...message) =>
    console.warn(
        chalk.yellow.bgBlack.inverse('  Warn:  '),
        chalk.yellow(' ', ...message, ' '),
    );
const log = (...message) =>
    console.log(
        chalk.magenta.bgBlack.inverse('  Log:  '),
        chalk.magenta(' ', ...message, ' '),
    );

function config_require(name) {
    try {
        const configPath = shell.pwd() + '/' + name; //require.resolve(name);
        console.log(configPath);
        return require(configPath);
    } catch (e) {
        error('Needs config file in root base project: clone.config.js');
        exit(0);
        // return false;
    }
}
// if (module_exists('./clone.json')) {
//     const cloneConfig = require('./clone.json');
// } else {

// }

console.log(chalk.cyan(figlet.textSync('Clone React Native Project')));
const sleep = () => new Promise(resolve => setTimeout(() => resolve(), 500));

//////////////////// Init variables clone config ////////////////////////
cloneConfig.clone = cloneConfig.clone.map(clone => {
    // const clone = {};
    clone.source = cloneConfig.base.folder;
    clone.sourceFull = path.resolve(cloneConfig.base.folder);
    clone.dest = clone.folder;
    clone.destFull = path.resolve(clone.dest);
    clone.packageOld = cloneConfig.base.package;
    clone.nameProject = clone.name.replace(/\s+/g, '');
    clone.doublequotes = '"';
    clone.quotes = "'";
    // clone.packageNew = clone.package;
    // clone.packageNew = cloneConfig.clone[0].package;
    // clone.name = cloneConfig.clone[0].name;

    if (
        !clone.source ||
        !clone.dest ||
        // !clone.packageOld ||
        // !clone.packageNew ||
        !clone.name
    ) {
        warn('Needs set parameters (folders, names) in config file');
        exit(0);
    }
    if (path.resolve(clone.source) == path.resolve(clone.dest)) {
        warn(
            "Oh No, No, No. Don't make equvivalent Source folde and Destinition folder",
        );
        exit(0);
    }
    // if (clone.source == join('./') || !clone.source) {
    //     warn('Bad parameter Source folder');
    //     exit(0);
    // }

    /** Adding exclude folders and files from all clones */
    let copy_all = [];
    clone.copy_global = cloneConfig.copy_global || [];
    clone.copy = clone.copy || [];
    copy_all = [...clone.copy_global, ...clone.copy];
    copy_all.map(copyObject => {
        // copyObject.from = replaceCloneVariable(copyObject.from, clone);
        // copyObject.to = replaceCloneVariable(copyObject.to, clone);
        let excludePath = path.normalize(
            replaceCloneVariable(copyObject.from, clone),
        );
        // console.log(
        //     'clone.name:   ' + clone.name + '  excludePath:' + excludePath,
        // );
        shell.test('-e', clone.sourceFull + '/' + excludePath) &&
            cloneConfig.exclude.push(excludePath);
        // warn('\nExclude: ' + excludePath);
    });

    return clone;
});

/** COPY PROJECT */
async function copyProject(clone) {
    // const load = loading('Cloning project').start();
    // await sleep();

    fs.existsSync(clone.destFull) || shell.exec('mkdir ' + clone.destFull);

    // remove all files in clone folder without '.git
    if (cloneConfig.options.remove) {
        let ls = shell
            .ls('-A', clone.destFull)
            .filter(e => e !== '.git' && e !== '.' && e !== '..');
        ls = ls.map(file => {
            let remove = clone.destFull + '/' + file;
            // log('Remove: ', remove);
            return remove;
        });
        shell.rm('-rf', ls);
    }

    if (os.type() === 'Linux' || os.type() === 'Darwin') {
        const excludePOSIX = cloneConfig.exclude
            .map(item => `--exclude ${item}`)
            .join(' ');

        shell.exec(
            `rsync -av --progress ${clone.source}/ ${clone.dest} ${excludePOSIX}`,
        );
    } else {
        const excludeWindows = cloneConfig.exclude.join(' ');

        shell.exec(
            // `robocopy ${clone.source} ${clone.dest} /mir /xd node_modules .history .git android/.gralde android/app/build android/build android/.idea`,
            `robocopy ${clone.source} ${clone.dest} /mir /xd ${excludeWindows}`,
        );
    }

    shell.cd(clone.destFull).code !== 0 && exit(1);
    let copy_all = [];
    clone.copy_global = cloneConfig.copy_global || [];
    clone.copy = clone.copy || [];
    copy_all = [...clone.copy_global, ...clone.copy];
    copy_all.forEach((item, index, array) => {
        let from = path.resolve(
            clone.sourceFull +
                '/' +
                path.join(replaceCloneVariable(item.from, clone)),
        );
        let to = path.resolve(
            clone.destFull +
                '/' +
                path.join(replaceCloneVariable(item.to, clone)),
        );
        console.log('Copy\nFrom: ' + from, '\n  To: ' + to);
        copydir.sync(from, to, {
            utimes: false, // Boolean | Object, keep addTime or modifyTime if true
            mode: false, // Boolean | Number, keep file mode if true
            cover: true, // Boolean, cover if file exists
            filter: function (stat, filepath, filename) {
                // do not want copy .html files
                // if (stat === 'file' && path.extname(filepath) === '.html') {
                //     return false;
                // }
                // do not want copy .svn directories
                // if (stat === 'directory' && filename === '.svn') {
                //     return false;
                // }
                // do not want copy symbolicLink directories
                if (stat === 'symbolicLink') {
                    return false;
                }
                return true; // remind to return a true value when file check passed.
            },
        });
    });

    // load.stop();
}

/** RENAME PROJECT */
async function renameProject(clone) {
    // const load = loading('Rename project').start();
    // await sleep();

    const git = simpleGit(clone.destFull);
    shell.cd(clone.destFull).code !== 0 && exit(1);
    // log(path.resolve(shell.ls('-d')[0]));

    //////////////////// Commit before RENAME ////////////////////////
    try {
        if (!fs.existsSync(clone.destFull + '/.git')) {
            log(`GIT INIT on Project ${clone.name}`);
            await git.init();
        }
        await git.add('./*');
        await git.commit(
            `📍 clone auto-commit before rename ${new Date().toISOString()}`,
        );
    } catch (e) {
        error(e);
        exit(1);
    }

    //////////////////// RENAME ////////////////////////
    // log(`RENAME Project ${clone.name}`);
    const rename =
        !clone.package || clone.package == clone.packageOld
            ? `npx react-native-rename "${clone.name}"`
            : `npx react-native-rename "${clone.name}" -b ${clone.package}`;
    log(`RENAME COMMAND=${rename}`);
    if (shell.exec(rename).code !== 0) {
        error(
            `Error: npx react-native-rename "${clone.name}" -b ${clone.package}`,
        );
        exit(1);
    }

    //////////////////// Replace In File ////////////////////////
    let renameFix = [
        {
            files: [
                './android/app/BUCK',
                './android/app/src/main/AndroidManifest.xml',
            ],
            from: '/(package\\s*=\\s*")(.+)(")/giu',
            to: '$1${clone.package}$3',
        },
        {
            files: './android/app/build.gradle',
            from: '/(applicationId\\s*")(.+)(")/giu',
            to: ['$1${clone.package}$3'],
        },
    ];

    let replace_all = [];
    clone.replace_global = cloneConfig.replace_global || [];
    clone.replace = clone.replace || [];
    replace_all = [...renameFix, ...clone.replace_global, ...clone.replace];
    console.log('Replace In File JSON options:', replace_all);
    replace_all.forEach((replaceitem, index) => {
        if (!replaceitem.files || !replaceitem.from || !replaceitem.to) {
            warn(
                `Replace In File not full options clone name: `,
                chalk.bold(clone.name),
            );
            return;
        }
        let options = Object.assign({}, replaceitem);

        /**  inject clone variable in all property options "Replace In File" */
        for (var key in replaceitem) {
            if (Array.isArray(replaceitem[key])) {
                let newArray = options[key].map(arrayvalue => {
                    let match = replaceCloneVariable(arrayvalue, clone);
                    if (key == 'files')
                        match = clone.destFull + '/' + path.normalize(match);
                    if (key == 'from') match = eval(match);
                    // log(`Replacer in file options.${key}[${i}]=` + match);
                    return match;
                });
                options[key] = newArray;
            } else {
                options[key] = replaceCloneVariable(replaceitem[key], clone);
                if (key == 'files')
                    options[key] =
                        clone.destFull + '/' + path.normalize(options[key]);
                if (key == 'from') options[key] = eval(options[key]);
                // log(`Replace in file options.${key}=` + options[key]);
            }
        }

        shell.cd(clone.destFull).code !== 0 && exit(1);
        try {
            const results = replace.sync(options);
            results.map(result => {
                // result.hasChanged ||
                //     console.log(
                //         `Replace in file: ${result.file}`,
                //         chalk.yellow(' NOT CHANGED'),
                //     );
                if (result.hasChanged) {
                    // console.log('Replace In File RESULT options:', options);
                    console.log(
                        `Replace In File: ${result.file}`,
                        chalk.green(' MODIFIED'),
                    );
                }
            });
        } catch (error) {
            console.error(chalk.red('Replace In File Error occurred: ', error));
        }
    });

    //////////////////// Commit after RENAME ////////////////////////
    try {
        log(`GIT Commit after rename on Project ${clone.name}`);
        await git.add('./*');
        await git.commit(
            `📍 clone auto-commit ${new Date().toISOString()}`, //📍 Unicode: U+1F4CD
        );
    } catch (e) {
        error(e);
        exit(1);
    }

    // load.stop();
}

/** RENAME PROJECT OLD */
async function renameProjectOLD(project) {
    const load = loading('Rename packages').start();
    await sleep();

    // project = {
    //     source: '../rn_starter',
    //     dest: path.resolve(join('../MyApp2')),
    //     name: 'MyApp2name', //new Package
    //     packageOld: 'rn_starter',
    //     packageNew: 'MyApp2',
    // };

    const pack = require(project.dest + '/app.json');

    function replaceContent(file) {
        shell.sed('-i', project.packageOld, project.packageNew, file);
        shell.sed('-i', pack.name, project.name.toLowerCase(), file);
        shell.sed('-i', pack.displayName, project.name.toLowerCase(), file);
        shell.sed('-i', pack.name, project.name, file);
        shell.sed('-i', pack.displayName, project.name, file);
        console.log(file, chalk.green('RENAME'));
    }

    const paths = [
        `${project.dest}/*.js`,
        `${project.dest}/*.json`,
        `${project.dest}/**/*.xml`,
        `${project.dest}/**/*.pbxproj`,
        `${project.dest}/**/*.java`,
        `${project.dest}/**/*.gradle`,
        `${project.dest}/**/*.h`,
        `${project.dest}/**/*.m`,
        `${project.dest}/**/*.xcscheme`,
        `${project.dest}/**/*.storyboard`,
        `${project.dest}/**/*.plist`,
        `${project.dest}/**/*.pro`,
        `${project.dest}/ios/Podfile`,
    ];

    paths.forEach(item => {
        shell.ls(item).forEach(file => replaceContent(file));
    });
    load.stop();

    const load2 = loading('Creating folders in the new package').start();
    await sleep();

    const pathAndroid = `${
        project.dest
    }/android/app/src/main/java/${project.packageNew.replace(/\./g, '/')}`;

    const pathIOS = `${project.dest}/ios`;
    log('pathIOS=', pathIOS);

    const foldersIOS = ['', '-tvOS', '-tvOSTests', '.xcodeproj', 'Tests'];

    await Promise.all(
        foldersIOS.map(async folder => {
            await new Promise(resolve => {
                let from = `${pathIOS}/${pack.name}${folder}`;
                let to = `${pathIOS}/${project.name.toLowerCase()}${folder}`;
                fs.rename(from, to, function (err) {
                    console.log('\nFrom: ', from, '\nTo:   ', to);
                    if (err) {
                        console.log(
                            chalk.yellow('Failed to rename IOS folder.'),
                            chalk.red('File or folder does not exist'),
                        );
                        resolve();
                    } else {
                        console.log(
                            chalk.green('IOS directory renamed successfully!'),
                        );
                        resolve();
                    }
                });
            });
        }),
    );

    load2.stop();

    const load3 = loading('Renaming files in the IOS folder').start();
    const iosFilesRename = [
        {
            from: `${pathIOS}/${project.name.toLowerCase()}.xcodeproj/xcshareddata/xcschemes/${pack.name.toLowerCase()}-tvOS.xcscheme`,
            to: `${pathIOS}/${project.name.toLowerCase()}.xcodeproj/xcshareddata/xcschemes/${project.name.toLowerCase()}-tvOS.xcscheme`,
        },
        {
            from: `${pathIOS}/${project.name.toLowerCase()}.xcodeproj/xcshareddata/xcschemes/${pack.name.toLowerCase()}.xcscheme`,
            to: `${pathIOS}/${project.name.toLowerCase()}.xcodeproj/xcshareddata/xcschemes/${project.name.toLowerCase()}.xcscheme`,
        },
        {
            from: `${pathIOS}/${project.name.toLowerCase()}Tests/${pack.name.toLowerCase()}Tests.m`,
            to: `${pathIOS}/${project.name.toLowerCase()}Tests/${project.name.toLowerCase()}Tests.m`,
        },
    ];

    await Promise.all(
        iosFilesRename.map(async folder => {
            await new Promise(resolve => {
                fs.rename(folder.from, folder.to, function (err) {
                    console.log('\nFrom: ', folder.from, '\nTo:   ', folder.to);
                    if (err) {
                        console.log(
                            chalk.yellow('Failed to rename IOS file.'),
                            chalk.red('File or folder does not exist'),
                        );
                        resolve();
                    } else {
                        console.log(
                            chalk.green('IOS file successfully renamed!'),
                        );
                        resolve();
                    }
                });
            });
        }),
    );

    load3.stop();

    const load4 = loading(
        'Copying contents of the previous package to the new package',
    ).start();
    const source = `${
        project.dest
    }/android/app/src/main/java/${project.packageOld.replace(/\./g, '/')}`;

    await new Promise(resolve => {
        console.log('\nsource:      ', source, '\npathAndroid: ', pathAndroid);
        fsExtra.move(source, pathAndroid, function (err) {
            if (err) {
                error(
                    'Failed to copy files to the new directory\n',
                    err.message,
                );
            } else {
                console.log(chalk.green('Files copied to the new directory'));
            }
            resolve();
        });
    });

    load4.stop();
}

/** INIT COMMANDS */
program.version(package.version, '-v, --version', 'current version');

program
    .command('clone [name]')
    .description(
        'Clones base project to new directories. Choice project [name == clone.name|clone.nameProject]',
    )
    .action(async (name, options) => {
        // console.log('project ', project);
        // console.log('read config from %s', program.opts().config);
        // console.log('setup for %s env(s) with %s mode', options.setup_mode);
        // exit(0);

        // warn('Starting...');
        for (let i = 0; i < cloneConfig.clone.length; i++) {
            let clone = cloneConfig.clone[i];
            if (name && !(name == clone.name || name == clone.nameProject)) {
                continue;
            }
            console.log(
                chalk.magentaBright(
                    '\n\n////////////////////  CLONING  ////////////////////',
                ),
            );
            console.log(
                chalk.magentaBright('NAME: '),
                chalk.green(clone.name),
                '    ',
                chalk.magentaBright('NAME PROJECT: '),
                chalk.green(clone.nameProject),
            );
            console.log('Current clone JSON:', clone);
            await copyProject(clone);
            await renameProject(clone);
        }
        // warn('Done!');

        console.log(
            chalk.blue(
                '\nPROJECT CLONE CREATED, PLEASE CLEAN THE CACHE AND RECOMPILE YOUR PROJECT!\n',
            ),
        );
    });

program
    .command('build [name]')
    .description(
        'Build all clones or one [name == clone.name|clone.nameProject]',
    )
    .option('-i, --ios', 'build only ios platform')
    .option('-a, --android', 'build only android platform')
    .action(async (name, options) => {
        let build_ios_flag = !options.android;
        let build_android_flag = !options.ios;
        console.log('build_ios_flag=', build_ios_flag);
        console.log('build_android_flag=', build_android_flag);
        // exit(0);
        for (let i = 0; i < cloneConfig.clone.length; i++) {
            let clone = cloneConfig.clone[i];
            if (name && !(name == clone.name || name == clone.nameProject)) {
                continue;
            }
            console.log(
                chalk.magentaBright(
                    '\n\n//////////////////// BUILD CLONE ////////////////////',
                ),
            );
            console.log(
                chalk.magentaBright('NAME: '),
                chalk.green(clone.name),
                '    ',
                chalk.magentaBright('NAME PROJECT: '),
                chalk.green(clone.nameProject),
            );
            // if (!fs.existsSync(clone.destFull + '/node_modules')) {
            // warn("copyNodeModules START....")
            // copyNodeModules(
            //     clone.sourceFull,
            //     clone.destFull,
            //     { devDependencies: false },
            //     (err, results) => {
            //         if (err) {
            //             console.error('ERROR Copy node_modules: ', err);
            //             return;
            //         }
            //         // Object.keys(results).forEach(name => {
            //         //     const version = results[name];
            //         //     console.log(`Package name: ${name}, version: ${version}`);
            //         // });
            //     },
            // );
            // exec(`npx copy-production-deps ${clone.sourceFull} ${clone.destFull}`);
            // warn("copyNodeModules END....")
            // }

            shell.cd(clone.destFull).code !== 0 && exit(1);
            if (exec('yarn check --verify-tree').code !== 0) {
                // exec('yarn install --offline --production').code !== 0 ||
                //     exec('yarn install --production');
                exec('yarn install --offline').code !== 0 ||
                    exec('yarn install');
                console.log(chalk.green('Install node_modules complete'));
                exec('npx pod-install').code !== 0;
                // || error('npx pod-install');
            }

            if (build_ios_flag === true) {
                shell.cd(clone.destFull).code !== 0 && exit(1);
                cloneConfig.build_ios.map(cmd => {
                    let strcmd = replaceCloneVariable(cmd, clone);
                    console.log(chalk.cyan(strcmd));
                    if (strcmd.substr(0, 3) == 'cd ') {
                        shell.cd(strcmd.match(/(?<=cd\s+).+/i)[0]);
                    } else {
                        shell.exec(
                            strcmd,
                            // {shell: '/bin/bash'}
                        );
                    }
                });
            }

            if (build_android_flag === true) {
                shell.cd(clone.destFull).code !== 0 && exit(1);
                cloneConfig.build_android.map(cmd => {
                    let strcmd = replaceCloneVariable(cmd, clone);
                    console.log(chalk.cyan(strcmd));
                    if (strcmd.substr(0, 3) == 'cd ') {
                        shell.cd(strcmd.match(/(?<=cd\s+).+/i)[0]);
                    } else {
                        shell.exec(
                            strcmd,
                            // {shell: '/bin/bash'}
                        );
                    }
                });
            }
        }

        // var builder = require('react-native-build');
        // builder(clone.destFull + '/android', function (result) {
        //     console.log(result); //output path
        // });
    });

program.parse(process.argv);

/////////////////// Tools ///////////////////
function replaceCloneVariable(string, clone) {
    // log('Clone variable input string=' + string);
    const str = string.replace(
        /(\$\{(.+?)\})/giu,
        (matched, index, original) => {
            let match = matched.match(/(?<=\.).+(?=\})/giu);
            return clone[match];
        },
    );
    // log('Clone variable injected=' + str);
    return str;
}
