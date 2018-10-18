const del = require('del');
const logger = require('../logger');

/**
 * "cleans" all the folders used by this script
 * @param {array} globs contains strings to glob files with
 * @param {boolean} buildTempDir if true, re-builds the `temp/` directory
 * @returns {Promise} that resolves when the `del` library completes its task
 */
module.exports = function clean(globs) {
  return del(globs).catch(err => logger('error', `Error: ${err}`));
};
