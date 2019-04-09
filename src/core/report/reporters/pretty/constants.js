import { gray, red, green, HORIZONTAL_LINE } from '../../utils.js'

export const MARKS = {
  // Pause symbol
  skip: '\u23F8',
  // Check symbol
  pass: '\u2714',
  // Cross symbol
  fail: '\u2718',
}

export const COLORS = {
  skip: gray,
  pass: green,
  fail: red,
}

export const NAMES = {
  skip: 'Skipped: ',
  pass: 'Passed:  ',
  fail: 'Failed:  ',
}

export const LINE = `\n${gray(HORIZONTAL_LINE)}\n`
