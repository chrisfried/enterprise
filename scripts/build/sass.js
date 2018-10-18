const chalk = require('chalk');
const path = require('path');
const sass = require('node-sass');
const importOnce = require('node-sass-import-once');

const createDirs = require('./create-dirs');
const logger = require('../logger');
const writeFile = require('./write-file');

// `node-sass` settings object
const DEFAULT_SETTINGS = {
  file: null,
  importer: importOnce,
  outFile: null,
  outputStyle: 'compressed',
  sourceMap: null,
};

/**
 * @param {object} settings incoming custom settings for `node-sass`
 * @returns {Promise} resolved on the completion of the `node-sass` process
 */
function runNodeSass(settings) {
  // Allow incoming settings to augment defaults
  if (typeof settingsOverrides === 'object') {
    settings = Object.assign(DEFAULT_SETTINGS, settings);
  }

  // Set the sourceMap to be relative
  settings.sourceMap = `${settings.outFile}.map`;

  // Create the directories that the output files will exist in (if applicable)
  const dirs = [];
  const pathsArr = settings.outFile.split(path.sep);
  pathsArr.forEach((thisPath, i) => {
    const thisDir = pathsArr.slice(0, i).join(path.sep);
    if (!thisDir || thisDir === '') {
      return;
    }
    dirs.push(thisDir);
  });
  createDirs(dirs);

  // Render the SASS file to CSS
  return sass.render({
    file: settings.file,
    options: settings,
  }, (err, result) => {
    if (err) {
      logger('error', `Node-Sass Error (${err.status}): ${err.message}`);
    }
    return writeFile(settings.outFile, result.css);
  });
}

/**
 * @param {object} filesList contains key/value pairs containing destination/source file paths.
 * @returns {Promise} resolved on the completion of all `node-sass` processes
 */
module.exports = function (filesList) {
  const sassPromises = [];
  const destFiles = Object.keys(filesList);

  destFiles.forEach((destFile) => {
    const settings = {
      file: filesList[destFile],
      outFile: destFile
    };

    sassPromises.push(runNodeSass(settings));
  });

  return Promise.all(sassPromises).then(() => {
    logger('info', `${chalk.cyan('node-sass')} processes (${destFiles.length}) have completed.`);
  });
};
