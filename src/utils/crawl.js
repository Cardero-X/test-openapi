'use strict'

const { promiseThen, promiseAll, promiseAllThen } = require('./promise')

// Crawl and replace an object.
// We use `promise[All][Then]()` utilities to avoid creating microtasks when
// no helpers is found or when helpers are synchronous.
const crawl = function(value, evalNode, { path = [], ...opts } = {}) {
  return crawlNode(value, path, { ...opts, evalNode })
}

const crawlNode = function(value, path, opts) {
  // Children must be evaluated before parents
  const valueA = crawlChildren(value, path, opts)
  return promiseThen(valueA, valueB => opts.evalNode(valueB, path, opts))
}

// Siblings evaluation is done in parallel for best performance.
const crawlChildren = function(value, path, opts) {
  if (Array.isArray(value)) {
    const children = value.map((child, index) => crawlNode(child, [...path, index], opts))
    return promiseAll(children)
  }

  if (typeof value === 'object' && value !== null) {
    const children = Object.entries(value).map(([key, child]) =>
      crawlProperty({ key, child, path, opts }),
    )
    return promiseAllThen(children, mergeProperties)
  }

  return value
}

const crawlProperty = function({ key, child, path, opts }) {
  const maybePromise = crawlNode(child, [...path, key], opts)
  return promiseThen(maybePromise, childA => getProperty({ key, child: childA }))
}

const getProperty = function({ key, child }) {
  // Values that are return `undefined` are omitted
  // (as opposed to being set to `undefined`) to keep task JSON-serializable
  // and avoid properties that are defined but set to `undefined`
  if (child === undefined) {
    return
  }

  return { [key]: child }
}

const mergeProperties = function(children) {
  return Object.assign({}, ...children)
}

module.exports = {
  crawl,
}
