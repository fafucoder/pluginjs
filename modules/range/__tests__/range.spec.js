import Range from '../src/main'
import { defaults as DEFAULTS } from '../src/constant'
import generateHTMLSample from './fixtures/sample'

describe('Range', () => {
  describe('Range()', () => {
    test('should have Range', () => {
      expect(Range).toBeFunction()
    })

    test('should have defaults', () => {
      expect(Range.defaults).toBeObject()
    })

    test('should have events', () => {
      expect(Range.events).toBeObject()
    })

    test('should have classes', () => {
      expect(Range.classes).toBeObject()
    })

    test('should have methods', () => {
      expect(Range.methods).toBeArray()
    })
  })

  describe('constructor()', () => {
    test('should work with element', () => {
      const html = generateHTMLSample()
      const range = Range.of(html.querySelector('.example-default'))

      expect(range).toBeObject()
      expect(range.options).toEqual(
        Object.assign(DEFAULTS, {
          units: {
            px: {
              max: 100,
              min: 10,
              step: 10
            }
          }
        })
      )
    })

    test('should have options', () => {
      const html = generateHTMLSample()
      const range = Range.of(html.querySelector('.example-default'))
      expect(range.options).toBeObject()
    })
  })

  describe('initialized()', () => {
    let $element

    beforeEach(() => {
      $element = generateHTMLSample().querySelector('.example-default')
    })

    test('should trigger ready event', () => {
      let called = 0
      $element.addEventListener('range:ready', () => {
        called++
      })
      const instance = Range.of($element)
      expect(called).toEqual(1)
      expect(instance.is('initialized')).toBeTrue()
    })
  })
})
