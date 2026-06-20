const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// exclusionList() escapes "/" to "\" on Windows, so forward-slash paths from
// Metro's watcher miss the block list and CMake .cxx folders crash Metro.
const NATIVE_BUILD_ARTIFACTS =
  /\.cxx[/\\]|[/\\]android[/\\](?:build|\.gradle)[/\\]/;

const config = {
  resolver: {
    blockList: [defaultConfig.resolver.blockList, NATIVE_BUILD_ARTIFACTS],
  },
};

module.exports = mergeConfig(defaultConfig, config);
