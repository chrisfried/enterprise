const fs = require('fs');
const commandLineArgs = require('yargs').argv;

const logger = require('../logger');

/**
 * @param {array} dirs an array of strings representing directories
 * @returns {void}
 */
module.exports = function createDirs(dirs) {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      if (commandLineArgs.verbose) {
        logger('info', `Created directory "${dir}"`);
      }
    }
  });
};
