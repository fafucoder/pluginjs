import Component from '@pluginjs/component'
import { compose, curry, debounce, throttle } from '@pluginjs/utils'
import { eventable, register, stateable, optionable } from '@pluginjs/decorator'
import Pj from '@pluginjs/factory'
import {
  defaults as DEFAULTS,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'
import Maybe from './maybe'

@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS
})
class Parallax extends Component {
  constructor(element, options = {}) {
    super(NAMESPACE, element)
    this.initOptions(DEFAULTS, options)
    this.initStates()
    this.initialize()
  }

  get scrollParent() {
    return this._scrollParent
  }

  set scrollParent(scrollParent) {
    this._scrollParent = scrollParent
  }

  parallaxHandle = () => {
    const { delayType, delay } = this.options
    switch (delayType) {
      case 'debounce': {
        return debounce(this.render, delay || 100)()
      }
      case 'throttle': {
        return throttle(this.render, delay)()
      }
      default:
        return this.render()
    }
  }

  initialize() {
    this.scrollParent = this.options.scrollParent || document
    this.options.speed = JSON.parse(this.options.speed)
    this.isHorizontal = Boolean(this.options.horizontal)
    this.render()
    this.enter('initialized')
    this.bind()
    this.trigger(EVENTS.READY)
  }

  render = () => {
    const mode = this.options.mode
    const getDocumentHeight = () => {
      const { documentElement, body } = document
      const bodyHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        documentElement.scrollHeight,
        documentElement.offsetHeight,
        documentElement.clientHeight
      )
      return bodyHeight - documentElement.clientHeight
    }
    const getScrollTop = () => {
      const { documentElement, body } = document
      return (
        window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0
      )
    }
    const offsetCheck = scrollTop => {
      if (this.options.offset) {
        if (scrollTop < this.options.offset) {
          return null
        }
        return scrollTop - this.options.offset
      }
      return scrollTop
    }
    const computePercent = curry((documentHeight, scrollTop) => {
      const multiple = 100
      return Math.round((scrollTop / documentHeight) * multiple)
    })
    const getMaxValue = (max, min) => {
      const multiple = 100
      return (max - min) / multiple
    }
    const either = (left, right) => {
      if (left || left === 0) {
        return left
      }
      return right
    }
    const computeOffset = (max, min, percent) =>
      percent *
        getMaxValue(
          either(this.options.max, max),
          either(this.options.min, min)
        ) +
      either(this.options.min, min)
    const modeMatch = curry((mode, percent) => {
      const multiple = 1000
      const speed = this.options.speed / multiple
      const rotate = 360
      switch (mode) {
        case 'translateY':
          this.element.style.transform = `translateY(${computeOffset(
            this.element.clientHeight / 2,
            0,
            percent
          ) * speed}px)`
          break
        case 'translateX':
          this.element.style.transform = `translateX(${computeOffset(
            this.element.clientWidth / 2,
            (this.element.clientWidth / 2) * -1,
            percent
          ) * speed}px)`
          break
        case 'rotateZ':
          this.element.style.transform = `rotateZ(${computeOffset(
            rotate,
            0,
            percent
          ) * speed}deg)`
          break
        case 'scale':
          this.element.style.transform = `scale(${computeOffset(1, 0, percent) *
            speed})`
          break
        case 'custom':
          this.customHandle(percent)
          break
        default:
          break
      }
      return null
    })
    return Maybe.of(getScrollTop()).map(
      compose(
        modeMatch(mode),
        computePercent(getDocumentHeight()),
        offsetCheck
      )
    )
  }

  bind() {
    Pj.emitter.on(this.eventNameWithId('scroll'), this.parallaxHandle)
    Pj.emitter.on(this.eventNameWithId('resize'), this.parallaxHandle)
  }

  unbind() {
    Pj.emitter.off(this.eventNameWithId('scroll'))
    Pj.emitter.off(this.eventNameWithId('resize'))
  }

  setDelay(type) {
    if (type !== 'debounce' && type !== 'throttle') {
      return false
    }
    this.delayType = type
    return true
  }

  enterHandle() {
    this.context.trigger(EVENTS.ENTER)
    this.context.render()
  }

  enable() {
    if (this.is('disabled')) {
      // this.viewport.enable();
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      // this.viewport.disable();
      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default Parallax
