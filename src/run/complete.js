'use strict'

const { pick } = require('lodash')

const { runHandlers } = require('../plugins')
const { addErrorHandler } = require('../errors')

// Run `complete` handlers
const completeTask = async function({ returnValue, plugins, config }) {
  const returnValueA = await runHandlers(returnValue, plugins, 'complete', { config })

  // Only keep single task|error return
  const returnValueB = pick(returnValueA, ['task', 'error'])

  return returnValueB
}

// If a `complete` handle throws, it becomes a `{ error }`
const completeTaskHandler = function(error) {
  return { error }
}

const eCompleteTask = addErrorHandler(completeTask, completeTaskHandler)

module.exports = {
  completeTask: eCompleteTask,
}