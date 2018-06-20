import DatePicker from '../src/main'
import { defaults as DEFAULTS } from '../src/constant'
import generateHTMLSample from './fixtures/sample'

describe('DatePicker', () => {
  describe('DatePicker()', () => {
    test('should have DatePicker', () => {
      expect(DatePicker).toBeFunction()
    })

    test('should have defaults', () => {
      expect(DatePicker.defaults).toBeObject()
    })

    test('should have events', () => {
      expect(DatePicker.events).toBeObject()
    })

    test('should have classes', () => {
      expect(DatePicker.classes).toBeObject()
    })

    test('should have methods', () => {
      expect(DatePicker.methods).toBeArray()
    })
  })

  describe('constructor()', () => {
    test('should work with element', () => {
      const datePicker = DatePicker.of(generateHTMLSample())

      expect(datePicker).toBeObject()
      expect(datePicker.options).toBeObject()
    })

    test('should have options', () => {
      const datePicker = DatePicker.of(generateHTMLSample())

      expect(datePicker.options).toBeObject()
    })
  })

  describe('jquery constructor', () => {
    test('should works with jquery fn', () => {
      const $element = generateHTMLSample()
      const api = DatePicker.of($element)

      expect(api).toEqual(api)
      expect(api).toBeObject()
      expect(api.options).toBeObject()
    })
  })

  describe('api call', () => {
    test('should not call bind', () => {
      // const $element = DatePicker.of(generateHTMLSample())
      // expect($element.bind()).toBeNil()
    })

    test('should call destroy', () => {
      const $element = DatePicker.of(generateHTMLSample())
      $element.destroy()
    })
  })

  describe('initialize()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample()
    })

    test('should trigger ready event', () => {
      let called = 0

      $element.addEventListener('datePicker:ready', () => {
        called++
      })

      api = DatePicker.of($element)
      expect(called).toEqual(1)
      expect(api.is('initialized')).toBeTrue()
    })
  })

  describe('destroy()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample()
      api = DatePicker.of($element)
    })

    test('should trigger destroy event', () => {
      let called = 0

      $element.addEventListener('datePicker:destroy', () => {
        called++
      })

      api.destroy()

      expect(called).toEqual(1)
      expect(api.is('initialized')).toBeFalse()
    })
  })

  describe('enable()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample()
      api = DatePicker.of($element)
    })

    test('should enable the plugin', () => {
      api.disable()
      api.enable()

      expect(api.is('disabled')).toBeFalse()
    })

    test('should trigger enable event', () => {
      let called = 0

      $element.addEventListener('datePicker:enable', () => {
        called++
      })

      api.enable()
      expect(called).toEqual(1)
      expect(api.is('disabled')).toBeFalse()
    })
  })

  describe('disable()', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample()
      api = DatePicker.of($element)
    })

    test('should disable the plugin', () => {
      api.disable()

      expect(api.is('disabled')).toBeTrue()
    })

    test('should trigger disable event', () => {
      let called = 0

      $element.addEventListener('datePicker:disable', () => {
        called++
      })

      api.disable()
      expect(called).toEqual(1)
      expect(api.is('disabled')).toBeTrue()
    })
  })

  describe('i18n', () => {
    let $element
    let api

    beforeEach(() => {
      $element = generateHTMLSample()
      api = DatePicker.of($element)
    })

    test('should have I18N', () => {
      expect(DatePicker.I18N).toBeObject()
    })

    describe('getLocale()', () => {
      test('should get default locale', () => {
        expect(api.getLocale()).toEqual(DEFAULTS.locale)
      })

      // test('should get locale with options set', () => {
      //   api = DatePicker.of($element, {
      //     locale: 'zh-cn'
      //   })
      //   // expect(api.getLocale()).toEqual('zh-cn')
      // })
    })

    describe('setLocale()', () => {
      test('should override default locale', () => {
        expect(api.getLocale()).toEqual(DEFAULTS.locale)

        api.setLocale('zh-cn')

        expect(api.getLocale()).toEqual('zh-cn')
      })
    })

    describe('addTransition', () => {
      test('should add transtion correctly', () => {
        DatePicker.I18N.addTranslation('zh-tw', { hello: '世界妳好' })
        api.setLocale('zh-tw')
        expect(api.translate('hello')).toEqual('世界妳好')
      })
    })

    describe('fallbacks', () => {
      test('should fallbacks to less specific locale', () => {
        api.setLocale('zh')
        expect(api.translate('buttons')).toEqual(['取消', '保存'])
      })
    })

    describe('translate()', () => {
      test('should get translated message', () => {
        expect(api.translate('buttons')).toEqual(['Cancel', 'Save'])

        api.setLocale('zh')
        expect(api.translate('buttons')).toEqual(['取消', '保存'])
      })
    })
  })
})
