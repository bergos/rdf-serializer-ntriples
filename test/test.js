'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-data-model')
const EventEmitter = require('events').EventEmitter
const NTriplesSerializer = require('..')

function streamToPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

function streamToPromiseError (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', reject)
    stream.on('error', resolve)
  })
}

describe('rdf-serializer-ntriples', () => {
  it('should be a constructor', () => {
    assert.equal(typeof NTriplesSerializer, 'function')
  })

  it('should have a .import method', () => {
    let serializer = new NTriplesSerializer()

    assert.equal(typeof serializer.import, 'function')
  })

  it('should forward the end event', () => {
    let input = new EventEmitter()
    let serializer = new NTriplesSerializer()
    let emitted = false

    serializer.on('end', () => {
      emitted = true
    })

    let result = streamToPromise(input).then(() => {
      assert.equal(emitted, true)
    })

    serializer.import(input)

    input.emit('end')

    return result
  })

  it('should forward the error event', () => {
    let input = new EventEmitter()
    let serializer = new NTriplesSerializer()
    let emitted = false

    serializer.on('error', () => {
      emitted = true
    })

    let result = streamToPromiseError(input).then(() => {
      assert.equal(emitted, true)
    })

    serializer.import(input)

    input.emit('error')

    return result
  })

  it('should serialize incoming quads', () => {
    let input = new EventEmitter()
    let serializer = new NTriplesSerializer()
    let quad = rdf.quad(rdf.namedNode('http://example.org/subject'), rdf.namedNode('http://example.org/predicate'),
      rdf.literal('object'), rdf.namedNode('http://example.org/graph'))

    serializer.import(input)

    let result = streamToPromise(serializer).then(() => {
      assert.equal(serializer.read().toString(), '<http://example.org/subject> <http://example.org/predicate> "object" <http://example.org/graph> .\n')
    })

    input.emit('data', quad)
    input.emit('end')

    return result
  })
})
