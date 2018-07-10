'use strict'

const { getSummary, yellow, gray, HORIZONTAL_LINE, indent } = require('../../utils')

const { NAMES } = require('./constants')

// Clears spinner and print final counters message
const end = function({ options: { spinner }, tasks }) {
  spinner.stop()

  const endMessage = getEndMessage({ tasks })
  return endMessage
}

// Print final reporting message with counter of passed|failed|skipped tasks
const getEndMessage = function({ tasks }) {
  const summaryString = printSummary({ tasks })
  return `${LINE}\n${indent(summaryString)}\n${LINE}\n`
}

const LINE = `\n${gray(HORIZONTAL_LINE)}\n`

const printSummary = function({ tasks }) {
  const summary = getSummary({ tasks })

  // Pad numbers to the right
  const padLength = String(summary.total).length

  return Object.entries(summary)
    .filter(shouldPrint)
    .map(([name, count]) => printEntry({ name, count, padLength }))
    .join('\n')
}

// Do not show `Skipped` if none skipped
const shouldPrint = function([name, count]) {
  return ['pass', 'fail'].includes(name) || (name === 'skip' && count !== 0)
}

const printEntry = function({ name, count, padLength }) {
  const nameA = NAMES[name]
  const countA = String(count).padStart(padLength)
  return `${yellow.bold(nameA)}${countA}`
}

module.exports = {
  end,
}
