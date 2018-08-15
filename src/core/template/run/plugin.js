'use strict'

const { addErrorHandler, BugError } = require('../../../errors')
const { getPath } = require('../../../utils')
const { isTemplateName } = require('../../../template')

// Retrieve all `plugin.template`
const getPluginsVars = function({ context, context: { _plugins: plugins } }) {
  const pluginsVarsMap = plugins.map(plugin => getPluginVars({ plugin, context }))
  const pluginsVarsMapA = Object.assign({}, ...pluginsVarsMap)

  const pluginsVars = Object.assign({}, ...Object.values(pluginsVarsMapA))
  return { pluginsVars, pluginsVarsMap: pluginsVarsMapA }
}

const getPluginVars = function({ plugin, plugin: { name, template }, context }) {
  if (template === undefined) {
    return
  }

  const vars = eGetVars({ plugin, context })

  validateVarNames({ vars, plugin })

  return { [name]: vars }
}

const getVars = function({ plugin: { template }, context }) {
  if (typeof template !== 'function') {
    return template
  }

  const vars = template(context)
  return vars
}

// Add `error.message|module` when `plugin.template` throws
const getVarsHandler = function(error, { plugin: { name } }) {
  error.message = `Error while retrieving 'plugin.template': ${error.message}`

  if (error.module === undefined) {
    error.module = `plugin-${name}`
  }

  throw error
}

const eGetVars = addErrorHandler(getVars, getVarsHandler)

// Validate `plugin.template` return value
const validateVarNames = function({ vars, plugin }) {
  Object.keys(vars).forEach(name => validateVarName({ name, plugin }))
}

const validateVarName = function({ name, plugin }) {
  if (isTemplateName({ name })) {
    return
  }

  const property = getPath(['plugin', 'template', name])
  const module = `plugin-${plugin.name}`
  throw new BugError(
    `'plugin.template' returned a template variable with an invalid name '${name}': it must be prefixed with $$ and only contain letters, digits, underscores and dashes`,
    { value: name, property, module },
  )
}

module.exports = {
  getPluginsVars,
}
