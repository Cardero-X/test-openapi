'use strict'

const { addErrorHandler, topLevelHandler } = require('../errors')
const { loadConfig } = require('../config')
const { getTasks } = require('../tasks')
const { getPlugins } = require('../plugins')

const { startTasks } = require('./start')
const { bootTask } = require('./task')
const { completeTask } = require('./complete')
const { endTasks } = require('./end')
const { getFinalReturn } = require('./final')

// Main entry point
// Does in order:
//  - load configuration
//  - load tasks
//  - load plugins
//  - run `start` plugin handlers
//  - for each task, in parallel:
//     - run `task` plugin handlers
//     - run `complete` plugin handlers
//  - run `end` plugin handlers
//  - normalize return value to an array of event objects
// If any task failed, throw an error instead
const run = async function(config = {}) {
  const configA = loadConfig({ config })

  const configB = await getTasks({ config: configA })

  const { config: configC, plugins } = getPlugins({ config: configB })

  const tasks = await ePerformRun({ config: configC, plugins })
  return tasks
}

const eRun = addErrorHandler(run, topLevelHandler)

// Fire all plugin handlers for all tasks
const performRun = async function({ config, plugins }) {
  const { config: configA, mRunTask } = await startTasks({ config, plugins })

  const tasks = await fireTasks({ config: configA, mRunTask, plugins })

  const events = await endTasks({ tasks, plugins, config: configA })

  const tasksC = getFinalReturn({ tasks, events })
  return tasksC
}

// Add `error.plugins` to every thrown error
const performRunHandler = function(error, { plugins }) {
  error.plugins = plugins.map(({ name }) => name)
  throw error
}

const ePerformRun = addErrorHandler(performRun, performRunHandler)

// Fire all tasks in parallel
const fireTasks = function({ config, config: { tasks }, mRunTask, plugins }) {
  const tasksA = tasks.map(task => fireTask({ task, config, mRunTask, plugins }))
  return Promise.all(tasksA)
}

const fireTask = async function({ task, config, mRunTask, plugins }) {
  const returnValue = await bootTask({ task, config, mRunTask, plugins })

  const returnValueA = await completeTask({ returnValue, plugins, config })

  return returnValueA
}

// The following plugins can be run (order in parenthesis).
// `start`, i.e. before all tasks:
//   - `glob` (1000): merge tasks whose name include globbing matching other task names.
//   - `only` (1100): check if `config|task.only` is used
//   - `skip` (1200): set dry run (`report.output: false`) if `config.skip: *`
//   - `spec` (1300): parse, validate and normalize an OpenAPI specification
//   - `report` (1400): start reporting
//   - `repeat` (1500): repeat each task `config.repeat` times
// `task`, i.e. for each task:
//   - `only` (1000): select tasks according to `config|task.only`
//   - `skip` (1100): skip task if `task.skip: true`
//   - `deps` (1200): replace all `deps`, i.e. references to other tasks
//   - `spec` (1300): add OpenAPI specification to `task.random|validate.*`
//   - `random` (1400): generates random values based on `task.random.*` JSON schemas
//   - `serialize` (1500): stringify request parameters
//   - `url` (1600): build request URL from request parameters
//   - `call` (1700): fire actual HTTP call
//   - `parse` (1800): parse response
//   - `validate` (1900): validate response against `task.validate.*` JSON schemas
// `complete`, i.e. after each tasks:
//   - `report` (1000): reporting for current task
// `end`, i.e. after all tasks:
//   - `report` (1000): end of reporting

module.exports = {
  run: eRun,
}
