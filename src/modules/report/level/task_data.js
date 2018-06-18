'use strict'

const { omit } = require('lodash')

const { isObject } = require('../../../utils')

// Apply `config.report.level` to remove some `task.PLUGIN.*`
const filterTaskData = function({
  task,
  task: { key },
  config: {
    originalTasks,
    report: {
      level: { taskData },
    },
  },
  plugins,
}) {
  const originalTask = originalTasks[key]

  return plugins.reduce(
    (taskA, { name }) => reduceTaskData({ task: taskA, originalTask, name, taskData }),
    task,
  )
}

const reduceTaskData = function({ task, originalTask, name, taskData }) {
  if (task[name] === undefined) {
    return task
  }

  return TASK_DATA[taskData]({ task, originalTask, name })
}

const keepNone = function({ task, name }) {
  return omit(task, name)
}

const keepAdded = function({ task, originalTask, name }) {
  if (originalTask[name] === undefined) {
    return task
  }

  if (!isObject(originalTask[name]) || !isObject(task[name])) {
    return
  }

  const originalTaskKeys = Object.keys(originalTask[name])
  const taskValue = omit(task[name], originalTaskKeys)

  if (Object.keys(taskValue).length === 0) {
    return omit(task, name)
  }

  return { ...task, [name]: taskValue }
}

const TASK_DATA = {
  all: ({ task }) => task,
  none: keepNone,
  added: keepAdded,
}

module.exports = {
  filterTaskData,
}
