const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;

const config = {
  projectRoot,
  watchFolders: [projectRoot],
  resolver: {
    // Ignore transient native build dirs that appear/disappear on Windows.
    blockList: [
      /.*[\\/]android[\\/]\.cxx[\\/].*/,
      /.*[\\/]android[\\/]build[\\/].*/,
      /.*[\\/]\.gradle[\\/].*/,
    ],
  },
  watcher: {
    healthCheck: {
      enabled: true,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
