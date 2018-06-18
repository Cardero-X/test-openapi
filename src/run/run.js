'use strict'

const { addErrorHandler } = require('../errors')
const { runHandlers, getTaskReturn } = require('../plugins')

// Run each `plugin.run()`
const runTask = async function({ task, config, plugins, isNested }) {
  const taskA = await eRunAll({ task, config, plugins, isNested })

  const taskB = getTaskReturn({ task: taskA, config, plugins })
  return taskB
}

const runAll = function({ task, config, plugins, isNested }) {
  // Pass simplified `runTask()` for recursive tasks
  // Tasks can use `isNested` to know if this is a recursive call
  // As opposed to regular `runTask()`, failed task throws.
  const recursiveRunTask = task => runTask({ task, config, plugins, isNested: true })

  return runHandlers(
    'run',
    plugins,
    task,
    { config },
    { runTask: recursiveRunTask, isNested },
    runPluginHandler,
    stopOnDone,
  )
}

const runAllHandler = function(error, { isNested }) {
  // Nested `runTask()` errors are propagated
  if (isNested) {
    throw error
  }

  // Top-level errors are returned as `task.error`
  const { task } = error
  delete error.task

  task.error = error
  return task
}

const eRunAll = addErrorHandler(runAll, runAllHandler)

// Error handler for each plugin handler
// We want to rememeber the current task on the first handler that throws.
// We do this by attaching it to `error.task`, then extracting it on a top-level
// error handler.
// The error is finally set to `task.error`
const runPluginHandler = function(error, task) {
  // Recursive tasks already have `error.task` defined
  if (error.task === undefined) {
    error.task = task
  }

  throw error
}

// Returning `done: true` in any `run` handler stops the iteration but without
// errors (as opposed to throwing an exception)
// This implies successful tasks might be emptier than expected.
// This is used e.g. by `skip|only` or `repeat` plugins
const stopOnDone = function({ done }) {
  return done
}

module.exports = {
  runTask,
}