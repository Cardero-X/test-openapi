import { is as isMime } from 'type-is'

import { TestOpenApiError } from '../../errors/error.js'
import { addErrorHandler } from '../../errors/handler.js'

// Retrieve a parser and stringifier for a specific MIME type
// TODO: replace by real body parsing library and add support for other
// content types
export const findBodyHandler = function({ mime }) {
  return BODY_HANDLERS.find(({ condition }) => condition({ mime })) || {}
}

const normalizeHandler = function({ name, condition, parse, stringify }) {
  const parseA = addErrorHandler(parse, bodyHandler.bind(null, name))
  return { condition, parse: parseA, stringify }
}

const bodyHandler = function(name, { message }) {
  throw new TestOpenApiError(
    `Could not read response body as ${name}: ${message}`,
    { property: 'task.call.response.body' },
  )
}

const isJson = function({ mime }) {
  return isMime(mime, JSON_MIMES) !== false
}

const JSON_MIMES = ['application/json', '+json']

const BODY_HANDLERS = [
  {
    name: 'JSON',
    condition: isJson,
    parse: JSON.parse,
    stringify: JSON.stringify,
  },
].map(normalizeHandler)
