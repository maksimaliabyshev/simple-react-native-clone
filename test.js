#!/usr/bin/env node

const program = require('commander');
const { join } = require('path');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const chalk = require('chalk');
const shell = require('shelljs');
const figlet = require('figlet');
const os = require('os');
const package = require('./package.json');
const simpleGit = require('simple-git');
const replace = require('replace-in-file');

const error = (...message) =>
    console.error(
        chalk.black.bgRed('  Error:  '),
        chalk.red.bgBlack(' ', ...message, ' '),
    );
const warn = (...message) =>
    console.warn(
        chalk.yellow.bgBlack.inverse('\n  Warn:  '),
        chalk.yellow(' ', ...message, ' '),
    );
const log = (...message) =>
    console.log(
        chalk.magenta.bgBlack.inverse('\n  Log:  '),
        chalk.magenta(' ', ...message, ' '),
    );

// console.log('===', os.type());
// console.log(os.type() === 'Darwin');

function module_exists(name) {
    try {
        require.resolve(name);
        return (cloneConfig = require(name));
    } catch (e) {
        console.error('Needs config file: ', name);
        return false;
    }
}
module_exists('./clone.config.js');
// console.log(clone.base.name);

// let source = path.resolve(join('../rn_'));
// console.log(source);
// let dest = path.resolve(join('../MyApp2'));
// console.log(dest);
// const dest = '..\\MyApp';
// var pack = path.resolve(path.join(dest + '/app.json'));

const clone = cloneConfig.clone[0];
clone.source = cloneConfig.base.folder;
clone.sourceFull = path.resolve(cloneConfig.base.folder);
clone.dest = cloneConfig.clone[0].folder;
clone.destFull = path.resolve(cloneConfig.clone[0].folder);
clone.packageOld = cloneConfig.base.package;
clone.packageNew = cloneConfig.clone[0].package;
// clone.name = cloneConfig.clone[0].name;
// clone.copy = cloneConfig.clone[0].copy;
clone.quotes = "'";
clone.doublequotes = '"';
clone.iosprojectname = clone.name.replace(/\s+/g, '');
clone.app = 'app';
// cloneConfig.clone.map(clone => {
//     !!clone.copy &&
//         clone.copy.map((item, index, array) => {
//             // let exclude = path.resolve(
//             //     path.resolve(cloneConfig.base.folder) +
//             //         '/' +
//             //         path.join(item.from),
//             // );
//             let exclude = path.normalize(item.from);
//             cloneConfig.exclude.push(exclude);
//             // let to = path.resolve(project.destFull + '/' + path.join(item.to));
//             log('\nExclude: ' + exclude);
//         });
// });
// console.log(cloneConfig.exclude);

//   {
//             "folder": "../rn_starter_company2",
//             "package": "com.rn_starter.company2",
//             "name": "App Name 2"
// }

if (
    !clone.source ||
    !clone.dest ||
    // !clone.packageOld ||
    // !clone.packageNew ||
    !clone.name
) {
    warn('Needs all BASE parameters in config');
    process.exit(0);
}
if (path.resolve(clone.source) == path.resolve(clone.dest)) {
    warn("Don't equvivalent Source folde and Destinition folder");
    process.exit(0);
}
if (clone.source == join('./') || !clone.source) {
    warn('Bad parameter Source folder');
    process.exit(0);
}

///////////////////////////////////////////////////////////////////////////
// let ls = shell.ls('-R', path.resolve(clone.dest));
// ls.push('.git');
// ls = ls.filter(e => e !== '.git');
// log(ls);

// log(new Date().toISOString());

//work
// async function test(clone) {
//     console.log('1');
//     await new Promise((resolve, reject) => {
//         setTimeout(() => {
//             console.log('2');
//             resolve();
//         }, 0);
//     });
//     console.log('3');
//     console.log(clone);
// }
// // test();
// const run = async () => {
//     console.log('Starting...');
//     for (let i = 0; i <= clones.length; i++) {
//         const output = await test(clones[i]);
//         console.log(output);
//     }
//     console.log('Done!');
// };
// run();

// console.log(clone.copy);

// clone.copy.forEach(async fruit => {
//     const numFruit = await getNumFruit(fruit);
//     console.log(numFruit);
// });
// const file = [
//     `${clone.destFull}/android/app/BUCK`,
//     `${clone.destFull}/android/app/src/main/AndroidManifest.xml`,
// ];
// let str = '    package = "com.starter.companyname.name"';
// // let from = new RegExp('package\\s*=\\s*"(.+)"', 'g');
// let from = /(package\s*=\s*")(.+)(")/g;
// let out = str.match(from);
// console.log(out);
// let rep = str.replace(from, '$1' + clone.packageNew + '$3');
// console.log(rep);
// // process.exit(0);

// const options = {
//     files: file,
//     from: from,
//     to: '$1' + clone.packageNew + '$3',
//     countMatches: true,
// };

// try {
//     const results = replace.sync(options);
//     console.log('Replacement results:', results);
// } catch (error) {
//     console.error('Error occurred:', error);
// }

// const file2 = [`${clone.destFull}/android/app/build.gradle`];
// let from2 = /(applicationId\s*")(.+)(")/g;
// const options2 = {
//     files: file2,
//     from: from2,
//     to: '$1' + clone.packageNew + '$3',
//     countMatches: true,
// };

// try {
//     const results2 = replace.sync(options2);
//     console.log('Replacement results:', results2);
// } catch (error) {
//     console.error('Error occurred:', error);
// }

//////////////////// Replace In File ////////////////////////
// let renameFix = [
//     {
//         files: [
//             './android/app/BUCK',
//             './android/app/src/main/AndroidManifest.xml',
//         ],
//         from:
//             '/(package\\s*=\\s*${clone.doublequotes})(.+)(${clone.doublequotes})/giu',
//         to: '$1${clone.package}$3',
//     },
//     {
//         files: './android/app/build.gradle',
//         from:
//             '/(applicationId\\s*${clone.doublequotes})(.+)(${clone.doublequotes})/giu',
//         to: ['$1${clone.package}$3'],
//     },
// ];

// clone.replace_global = cloneConfig.replace_global;
// clone.replace_global = clone.replace_global || [];
// clone.replace = clone.replace || [];
// clone.replace_all = [...renameFix, ...clone.replace_global, ...clone.replace];
// clone.replace_all.forEach((replaceitem, index) => {
//     if (!replaceitem.files || !replaceitem.from || !replaceitem.to) {
//         warn(
//             `Replace in file not full options clone name: `,
//             chalk.bold(clone.name),
//         );
//         return;
//     }
//     const options = replaceitem;

//     /**  inject clone variable in all property options "replace in file" */
//     for (var key in replaceitem) {
//         if (Array.isArray(replaceitem[key])) {
//             let newArray = options[key].map((arrayvalue, i) => {
//                 let match = replaceCloneVariable(arrayvalue);
//                 if (key == 'files')
//                     match = clone.destFull + '/' + path.normalize(match);
//                 if (key == 'from') match = eval(match);
//                 // log(`Replacer in file options.${key}[${i}]=` + match);
//                 return match;
//             });
//             options[key] = newArray;
//         } else {
//             options[key] = replaceCloneVariable(replaceitem[key]);
//             if (key == 'files')
//                 options[key] =
//                     clone.destFull + '/' + path.normalize(options[key]);
//             if (key == 'from') options[key] = eval(options[key]);
//             // log(`Replace in file options.${key}=` + options[key]);
//         }
//     }

//     shell.cd(clone.destFull);
//     try {
//         const results = replace.sync(options);
//         results.map(result => {
//             // result.hasChanged ||
//             //     console.log(
//             //         `Replace in file: ${result.file}`,
//             //         chalk.yellow(' NOT CHANGED'),
//             //     );
//             if (result.hasChanged) {
//                 console.log(options);
//                 console.log(
//                     `Replace in file: ${result.file}`,
//                     chalk.green(' REPLACED'),
//                 );
//             }
//         });
//     } catch (error) {
//         console.error(chalk.red('REPLACE IN FILE Error  occurred: ', error));
//     }
// });

// function replaceCloneVariable(string) {
//     // log('Clone variable input string=' + string);
//     const str = string.replace(
//         /(\$\{(.+?)\})/giu,
//         (matched, index, original) => {
//             let match = matched.match(/(?<=\.).+(?=\})/giu);
//             return clone[match];
//         },
//     );
//     // log('Clone variable injected=' + str);
//     return str;
// }

// shell.cd(clone.destFull);
// shell.exec(
//     'yarn install --offline --production',
//     // {
//     //     shell: '/bin/bash',
//     // },
//     // stdout => {
//     //     console.log(stdout);
//     // },
// );

console.log('cd ./ios/asddsd/sdsd'.match(/(?<=cd\s).+/i)[0]);

let str = 'cd ./ios/asddsd/sdsd';
console.log(str.substr(0, 2));
console.log(str.substr(3));
