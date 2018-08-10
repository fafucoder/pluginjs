import Component from '@pluginjs/component'
import templateEngine from '@pluginjs/template'
import easing from '@pluginjs/easing'
import { addClass, removeClass } from '@pluginjs/classes'
import { setStyle, offset as getOffset } from '@pluginjs/styled'
import { bindEvent, removeEvent } from '@pluginjs/events'
import { append, parseHTML, query } from '@pluginjs/dom'
import {
  pointer,
  pointerEvent,
  touch,
  transform,
  transform3D,
  transformProperty,
  transition,
  transitionEndEvent,
  transitionProperty
} from '@pluginjs/feature'
import { isNumeric, isNumber, isPercentage } from '@pluginjs/is'
import { convertPercentageToFloat, getTime } from '@pluginjs/utils'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  optionable
} from '@pluginjs/decorator'
import Keyboard from './keyboard'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'

@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS
})
class Scrollbar extends Component {
  constructor(element, options = {}) {
    super(NAMESPACE, element)

    this.initOptions(DEFAULTS, options)
    this.initClasses(CLASSES)
    element.direction = this.options.direction

    if (this.options.direction === 'vertical') {
      this.attributes = {
        axis: 'Y',
        position: 'top',
        length: 'height',
        clientLength: 'clientHeight'
      }
    } else if (this.options.direction === 'horizontal') {
      this.attributes = {
        axis: 'X',
        position: 'left',
        length: 'width',
        clientLength: 'clientWidth'
      }
    }

    // Current state information for the drag operation.
    this._drag = {
      time: null,
      pointer: null
    }

    // Current timeout
    this._frameId = null

    // Current handle position
    this.handlePosition = 0

    this.easing = easing.get(this.options.easing) || easing.get('ease')

    this.initStates()
    this.initialize()
  }

  initialize() {
    const options = this.options

    this.$handle = query(this.options.handleSelector, this.element)

    if (!this.$handle) {
      this.$handle = parseHTML(
        templateEngine.compile(options.handleTemplate)({
          handle: this.classes.HANDLE
        })
      )
      append(this.$handle, this.element)
    } else {
      addClass(this.classes.HANDLE, this.$handle)
    }

    addClass(this.classes.CONTAINER, this.element).setAttribute(
      'draggable',
      false
    )

    if (this.options.direction === 'vertical') {
      addClass(this.classes.VERTICAL, this.element)
    } else {
      addClass(this.classes.HORIZONTAL, this.element)
    }

    if (options.theme) {
      addClass(this.getThemeClass(), this.element)
    }
    if (options.barLength !== null) {
      this.setBarLength(options.barLength)
    }

    if (options.handleLength !== null) {
      this.setHandleLength(options.handleLength)
    }

    this.updateLength()

    this.bind()

    if (this.options.keyboard) {
      this.KEYBOARD = new Keyboard(this)
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  bind() {
    if (this.options.mouseDrag) {
      bindEvent(
        {
          type: this.eventName('mousedown'),
          handler: this.onDragStart.bind(this)
        },
        this.$handle
      )
      bindEvent(
        {
          type: this.eventName('dragstart'),
          handler: () => false
        },
        this.$handle
      )
      bindEvent(
        {
          type: this.eventName('selectstart'),
          handler: () => false
        },
        this.$handle
      )
    }

    if (this.options.touchDrag && touch) {
      bindEvent(
        {
          type: this.eventName('touchstart'),
          handler: this.onDragStart.bind(this)
        },
        this.$handle
      )
      bindEvent(
        {
          type: this.eventName('touchcancel'),
          handler: this.onDragEnd.bind(this)
        },
        this.$handle
      )
    }

    if (this.options.pointerDrag && pointer) {
      bindEvent(
        {
          type: this.eventName(pointerEvent('pointerdown')),
          handler: this.onDragStart.bind(this)
        },
        this.$handle
      )
      bindEvent(
        {
          type: this.eventName(pointerEvent('pointercancel')),
          handler: this.onDragEnd.bind(this)
        },
        this.$handle
      )
    }

    if (this.options.clickMove) {
      bindEvent(
        {
          type: this.eventName('mousedown'),
          handler: this.onClick.bind(this)
        },
        this.element
      )
    }

    if (this.options.mousewheel) {
      bindEvent(
        {
          type: this.eventName('mousewheel'),
          handler: e => {
            let delta
            if (this.options.direction === 'vertical') {
              delta = e.deltaFactor * e.deltaY
            } else if (this.options.direction === 'horizontal') {
              delta = -1 * e.deltaFactor * e.deltaX
            }
            let offset = this.getHandlePosition()
            if (offset <= 0 && delta > 0) {
              return true
            } else if (offset >= this.barLength && delta < 0) {
              return true
            }
            offset -= this.options.mousewheelSpeed * delta
            this.move(offset, true)
            return false
          }
        },
        this.element
      )
    }

    bindEvent(
      {
        type: this.eventName('mouseenter'),
        handler: () => {
          addClass(this.classes.HOVERING, this.element)
          this.enter('hovering')
          this.trigger(EVENTS.HOVER)
        }
      },
      this.element
    )

    bindEvent(
      {
        type: this.eventName('mouseleave'),
        handler: () => {
          removeClass(this.classes.HOVERING, this.element)

          if (!this.is('hovering')) {
            return
          }
          this.leave('hovering')
          this.trigger(EVENTS.HOVERED)
        }
      },
      this.element
    )
  }

  onClick(event) {
    const num = 3

    if (event.which === num) {
      return
    }

    if (event.target === this.$handle) {
      return
    }

    this._drag.time = new Date().getTime()
    this._drag.pointer = this.pointer(event)
    const offset = getOffset(this.$handle)
    let distance = this.distance(
      {
        x: offset.left,
        y: offset.top
      },
      this._drag.pointer
    )
    let factor = 1

    if (distance > 0) {
      distance -= this.handleLength
    } else {
      distance = Math.abs(distance)
      factor = -1
    }

    if (distance > this.barLength * this.options.clickMoveStep) {
      distance = this.barLength * this.options.clickMoveStep
    }
    this.moveBy(factor * distance, true)
  }

  // Handles `touchstart` and `mousedown` events.
  onDragStart(event) {
    const num = 3
    if (event.which === num) {
      return
    }

    // this.$element.toggleClass(this.options.draggingClass, event.type === 'mousedown');
    addClass(this.classes.DRAGGING, this.element)

    this._drag.time = new Date().getTime()
    this._drag.pointer = this.pointer(event)

    this.MovingInit = false

    if (this.options.mouseDrag) {
      bindEvent(
        {
          type: this.eventName('mouseup'),
          handler: this.onDragEnd.bind(this)
        },
        document
      )

      bindEvent(
        {
          type: this.eventName('mousemove'),
          handler: this.onDragMove.bind(this)
        },
        document
      )
    }

    if (this.options.touchDrag && touch) {
      bindEvent(
        {
          type: this.eventName('touchend'),
          handler: this.onDragEnd.bind(this)
        },
        document
      )

      bindEvent(
        {
          type: this.eventName('touchmove'),
          handler: this.onDragMove.bind(this)
        },
        document
      )
    }

    if (this.options.pointerDrag && pointer) {
      bindEvent(
        {
          type: this.eventName(pointerEvent('pointerup')),
          handler: this.onDragEnd.bind(this)
        },
        document
      )

      bindEvent(
        {
          type: this.eventName(pointerEvent('pointermove')),
          handler: this.onDragMove.bind(this)
        },
        document
      )
    }

    bindEvent(
      {
        type: this.eventName('blur'),
        handler: this.onDragMove.bind(this)
      },
      document
    )
  }

  // Handles the `touchmove` and `mousemove` events.
  onDragMove(event) {
    if (!this.MovingInit) {
      this.enter('dragging')
      this.trigger(EVENTS.DRAG)
      this.MovingInit = true
    }

    const distance = this.distance(this._drag.pointer, this.pointer(event))

    if (!this.is('dragging')) {
      return
    }

    event.preventDefault()
    this.moveBy(distance, true, true)
  }

  // Handles the `touchend` and `mouseup` events.
  onDragEnd() {
    removeEvent(this.eventName(), document)
    removeClass(this.classes.DRAGGING, this.element)
    this.handlePosition = this.getHandlePosition()

    if (!this.is('dragging')) {
      return
    }

    this.leave('dragging')
    this.trigger(EVENTS.DRAGGED)
  }
  /**
   * [Gets unified pointer coordinates from event.]
   * @param  {[type]} event [description]
   * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
   */
  pointer(event) {
    const result = {
      x: null,
      y: null
    }

    event = event.originalEvent || event || window.event

    // event =
    //   event.touches && event.touches.length
    //     ? event.touches[0]
    //     : event.changedTouches && event.changedTouches.length
    //       ? event.changedTouches[0]
    //       : event;

    event =
      event.changedTouches && event.changedTouches.length
        ? event.changedTouches[0]
        : event

    event = event.touches && event.touches.length ? event.touches[0] : event

    if (event.pageX) {
      result.x = event.pageX
      result.y = event.pageY
    } else {
      result.x = event.clientX
      result.y = event.clientY
    }

    return result
  }

  // Gets the distance of two pointer.
  distance(first, second) {
    if (this.options.direction === 'vertical') {
      return second.y - first.y
    }
    return second.x - first.x
  }

  setBarLength(length, update) {
    if (typeof length !== 'undefined') {
      this.element.style[this.attributes.length] = `${length.toString()}px`
    }
    if (update !== false) {
      this.updateLength()
    }
  }

  setHandleLength(length, update) {
    if (typeof length !== 'undefined') {
      if (length < this.options.minHandleLength) {
        length = this.options.minHandleLength
      } else if (
        this.options.maxHandleLength &&
        length > this.options.maxHandleLength
      ) {
        length = this.options.maxHandleLength
      }

      this.$handle.style[this.attributes.length] = `${length.toString()}px`

      if (update !== false) {
        this.updateLength(length)
      }
    }
  }

  updateLength(length, barLength) {
    if (typeof length !== 'undefined') {
      this.handleLength = length
    } else {
      this.handleLength = this.getHandleLenght()
    }
    if (typeof barLength !== 'undefined') {
      this.barLength = barLength
    } else {
      this.barLength = this.getBarLength()
    }
  }

  getBarLength() {
    return this.element[this.attributes.clientLength]
  }

  getHandleLenght() {
    return this.$handle[this.attributes.clientLength]
  }

  getHandlePosition() {
    let value
    if (this.options.useCssTransforms && transform) {
      const transform = this.$handle.style[transformProperty()]
      const reg = /[^\(\)]+(?=\))/g /* eslint-disable-line */
      value = transform
        .match(reg)[0]
        .split(',')
        .map(s => s.replace('px', '').replace(' ', ''))

      if (!value) {
        return 0
      }

      if (this.attributes.axis === 'X') {
        value = value[0]
      } else {
        value = value[1]
      }
    } else {
      value = this.$handle.style[this.attributes.position]
    }

    return parseFloat(value.replace('px', ''))
  }

  makeHandlePositionStyle(value) {
    let property
    let x = '0'
    let y = '0'

    if (this.options.useCssTransforms && transform) {
      if (this.attributes.axis === 'X') {
        x = `${value}px`
      } else {
        y = `${value}px`
      }

      property = transformProperty()

      if (this.options.useCssTransforms3D && transform3D) {
        value = `translate3d(${x},${y},0)`
      } else {
        value = `translate(${x},${y})`
      }
    } else {
      property = this.attributes.position
    }
    const temp = {}
    temp[property] = value

    return temp
  }

  setHandlePosition(value) {
    const style = this.makeHandlePositionStyle(value)
    setStyle(style, this.$handle)

    if (!this.is('dragging')) {
      this.handlePosition = parseFloat(value)
    }
  }

  moveTo(value, trigger, sync) {
    let type = typeof value

    if (type === 'string') {
      if (isPercentage(value)) {
        value =
          convertPercentageToFloat(value) * (this.barLength - this.handleLength)
      }

      value = parseFloat(value)
      type = 'number'
    }

    if (type !== 'number') {
      return
    }

    this.move(value, trigger, sync)
  }

  moveBy(value, trigger, sync) {
    let type = typeof value

    if (type === 'string') {
      if (isPercentage(value)) {
        value =
          convertPercentageToFloat(value) * (this.barLength - this.handleLength)
      }

      value = parseFloat(value)
      type = 'number'
    }

    if (type !== 'number') {
      return
    }

    this.move(this.handlePosition + value, trigger, sync)
  }

  move(value, trigger, sync) {
    if (!isNumber(value) || this.is('disabled')) {
      return
    }
    if (value < 0) {
      value = 0
    } else if (value + this.handleLength > this.barLength) {
      value = this.barLength - this.handleLength
    }

    if (!this.is('dragging') && sync !== true) {
      this.doMove(value, this.options.duration, this.easing, trigger)
    } else {
      this.setHandlePosition(value)

      if (trigger) {
        this.trigger(
          EVENTS.CHANGE,
          value / (this.barLength - this.handleLength)
        )
      }
    }
  }

  oneBind(eventName, element, callback) {
    if (!this.oneEventArr) {
      this.oneEventArr = {}
    }

    if (!this.oneEventArr[element]) {
      this.oneEventArr[element] = { hasBind: false }
    }

    this.oneBindcallback = () => {
      callback()
      removeEvent(eventName, element)
      this.oneEventArr[element].hasBind = false
    }

    if (!this.oneEventArr[element].hasBind) {
      bindEvent(
        {
          type: eventName,
          handler: this.oneBindcallback.bind(this)
        },
        element
      )
      this.oneEventArr[element].hasBind = true
    }
  }

  doMove(value, duration, easing, trigger) {
    let property
    this.enter('moving')
    duration = duration ? duration : this.options.duration
    easing = easing ? easing : this.easing

    const style = this.makeHandlePositionStyle(value)
    for (property in style) {
      if ({}.hasOwnProperty.call(style, property)) {
        break
      }
    }

    if (this.options.useCssTransitions && transition) {
      this.enter('transition')
      this.prepareTransition(property, duration, easing.css())

      this.oneBind(transitionEndEvent(), this.$handle, () => {
        transitionProperty()
        this.$handle.style[transitionProperty()] = ''
        if (trigger) {
          this.trigger(
            EVENTS.CHANGE,
            value / (this.barLength - this.handleLength)
          )
        }
        this.leave('transition')
        this.leave('moving')
      })

      this.setHandlePosition(value)
    } else {
      this.enter('animating')

      const startTime = getTime()
      const start = this.getHandlePosition()
      const end = value

      const run = time => {
        let percent = (time - startTime) / this.options.duration

        if (percent > 1) {
          percent = 1
        }

        percent = this.easing(percent)
        const current = parseFloat(start + percent * (end - start), 10)
        this.setHandlePosition(current)

        if (trigger) {
          this.trigger(
            EVENTS.CHANGE,
            current / (this.barLength - this.handleLength)
          )
        }

        if (percent === 1) {
          window.cancelAnimationFrame(this._frameId)
          this._frameId = null

          this.leave('animating')
          this.leave('moving')
        } else {
          this._frameId = window.requestAnimationFrame(run)
        }
      }

      this._frameId = window.requestAnimationFrame(run)
    }
  }

  prepareTransition(property, duration, easing, delay) {
    const temp = []
    if (property) {
      temp.push(property)
    }
    if (duration) {
      if (isNumeric(duration)) {
        duration = `${duration}ms`
      }
      temp.push(duration)
    }
    if (easing) {
      temp.push(easing)
    } else {
      temp.push(this.easing.css())
    }
    if (delay) {
      temp.push(delay)
    }
    this.$handle.style[transitionProperty()] = temp.join(' ')
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
    }

    removeClass(this.classes.DISABLED, this.element)
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled')
    }

    addClass(this.classes.DISABLED, this.element)
    this.trigger(EVENTS.DISABLE)
  }

  unbind() {
    removeEvent(this.eventName(), this.$handle)
    removeEvent(this.eventName(), this.element)
    this.KEYBOARD.unbind()
  }

  destroy() {
    if (this.is('initialized')) {
      removeClass(this.classes.HANDLE, this.$handle)

      removeClass(this.classes.CONTAINER, this.element)
      removeClass(this.classes.VERTICAL, this.element)
      removeClass(this.classes.HORIZONTAL, this.element)
      this.element.setAttribute('draggable', null)

      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.element)
      }

      this.unbind()
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default Scrollbar
