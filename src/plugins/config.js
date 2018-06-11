'use strict'

// Retrieve `config.plugins`
const getConfigPlugins = function({ config: { plugins, ...config } }) {
  const pluginsA = [...DEFAULT_PLUGINS, ...plugins]
  return { config, plugins: pluginsA }
}

// Plugins always included
const DEFAULT_PLUGINS = [
  'glob',

  'only',
  'skip',
  'deps',
  'spec',
  'random',
  'serialize',
  'url',
  'call',
  'parse',
  'validate',

  'report',
  'repeat',
]

module.exports = {
  getConfigPlugins,
}
