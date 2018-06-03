'use strict'

const { dump: yamlDump, DEFAULT_FULL_SCHEMA } = require('js-yaml')
const { omitBy } = require('lodash')

// YAML error properties for each failed assertion
const getErrorProps = function({ ok, error }) {
  if (ok || error === undefined) {
    return ''
  }

  const errorA = getError(error)

  const errorProps = serializeErrorProps({ error: errorA })
  return errorProps
}

const getError = function({ message, name, stack, ...error }) {
  const at = getAt({ stack })

  const errorA = { message, operator: name, at, stack, ...error }
  const errorB = omitBy(errorA, value => value === undefined)
  return errorB
}

const getAt = function({ stack }) {
  if (stack === undefined) {
    return ''
  }

  const [, at] = stack.split('\n')
  return at.replace(AT_REGEXP, '')
}

// Remove leading '  at' from stack trace
const AT_REGEXP = /^.*at /

// Serialize error to indented YAML
const serializeErrorProps = function({ error }) {
  const errorProps = yamlDump(error, YAML_OPTS)
  const errorPropsA = indent({ errorProps })
  const errorPropsB = `\n  ---${errorPropsA}...`
  return errorPropsB
}

const YAML_OPTS = {
  schema: DEFAULT_FULL_SCHEMA,
  noRefs: true,
}

// Indent error properties by two spaces
const indent = function({ errorProps }) {
  return errorProps.replace(INDENT_REGEX, '\n  ')
}

const INDENT_REGEX = /\n|^/g

module.exports = {
  getErrorProps,
}
