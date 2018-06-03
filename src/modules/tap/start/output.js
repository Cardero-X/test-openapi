'use strict'

const { stdout } = require('process')
const { Writable } = require('stream')
const { createWriteStream } = require('fs')

const { TestOpenApiError, addErrorHandler } = require('../../../errors')

// Retrieves stream to write to, according to `config.tap.output`
const getOutput = async function({ tap: { output, reporter } }) {
  const getStream = STREAMS[String(output)] || STREAMS.default
  const stream = await getStream({ output })
  const streamA = useReporter({ stream, reporter })
  return streamA
}

// When `config.tap.output` is `true` (default), write to `stdout`
const getStdout = function() {
  return stdout
}

// When `config.tap.output` is `false`, silent output
const getSilentStream = function() {
  return new SilentStream()
}

class SilentStream extends Writable {
  _write(chunk, encoding, cb) {
    setImmediate(cb)
  }
}

// When `config.tap.output` is a string, write to a file
const getFileStream = function({ output }) {
  return new Promise((resolve, reject) => {
    const stream = createWriteStream(output)
    stream.on('open', resolve.bind(null, stream))
    stream.on('error', reject)
  })
}

const getFileStreamHandler = function({ message }, { output }) {
  throw new TestOpenApiError(`Could not write output to file '${output}': ${message}`, {
    property: 'tap.output',
    actual: output,
  })
}

const eGetFileStream = addErrorHandler(getFileStream, getFileStreamHandler)

const STREAMS = {
  true: getStdout,
  false: getSilentStream,
  default: eGetFileStream,
}

// Use `tap.reporter` if it is set (by another plugin, like `report` plugin)
const useReporter = function({ stream, reporter }) {
  if (reporter === undefined) {
    return stream
  }

  reporter.pipe(stream)
  return reporter
}

module.exports = {
  getOutput,
}
