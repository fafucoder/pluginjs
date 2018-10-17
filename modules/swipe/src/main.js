import anime from 'animejs'
import Component from '@pluginjs/component'
import { addClass, removeClass, hasClass } from '@pluginjs/classes'
import { setStyle, getStyle } from '@pluginjs/styled'
import { isPlainObject } from '@pluginjs/is'
import { bindEvent, removeEvent } from '@pluginjs/events'
import {
  append,
  wrap,
  closest,
  find,
  parent,
  parentWith,
  queryAll
} from '@pluginjs/dom'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  optionable
} from '@pluginjs/decorator'
import templateEngine from '@pluginjs/template'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'

import Item from './item'
import ImageLoader from '@pluginjs/image-loader'
import Loader from '@pluginjs/loader'
import Swipeable from '@pluginjs/swipeable'
import Arrows from '@pluginjs/arrows'
import Dots from '@pluginjs/dots'

@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class Swipe extends Component {
  constructor(element, options = {}) {
    super(element)
    this.setupOptions(options)
    this.setupClasses()

    addClass(this.classes.NAMESPACE, this.element)

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.element)
    }

    if (this.options.height) {
      this.setHeight(this.options.height)
    }

    // wrap width
    this.width = parseFloat(getStyle('width', this.element), 10)

    this.itemNums = this.options.itemNums
    this.gutter = this.options.gutter
    this.active = 0

    this.setupStates()
    this.initialize()
  }

  initialize() {
    this.build()
    this.initSwipeable()
    this.bind()

    this.active =
      this.options.defaultActive > this.maxActiveCount
        ? this.maxActiveCount
        : this.options.defaultActive

    this.move(this.itemInstances[this.active].info.x, { trigger: false })

    if (!this.options.group) {
      addClass(
        `${this.classes.ACTIVE}`,
        this.itemInstances[this.active || 0].$el
      )
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  build() {
    this.buildWrapper()

    this.items = this.getItems()

    this.buildContainer()

    this.itemInstances = this.getItemInstances(this.items)

    this.computeItemLocation(this.itemInstances)

    this.sortedItems = this.getItemsBySort()

    this.maxActiveCount = this.getMaxActiveCount()

    if (this.options.arrows) {
      this.buildArrows()
    }

    if (this.options.pagination) {
      this.buildPagination()
    }
  }

  buildWrapper() {
    this.wrapper = closest(`.${this.classes.WRAPPER}`, this.element)
    if (!this.wrapper) {
      if (this.options.wrapperSelector) {
        addClass(
          this.classes.WRAPPER,
          closest(this.options.wrapperSelector, this.element)
        )
      } else {
        wrap(`<div class="${this.classes.WRAPPER}"></div>`, this.element)
      }
      this.wrapper = parentWith(hasClass(this.classes.WRAPPER), this.element)
    }
  }

  getItems() {
    let items = queryAll(`.${this.classes.ITEM}`, this.element)
    if (items.length === 0) {
      items = queryAll(this.options.itemSelector, this.element)
      items.forEach(item => {
        addClass(this.classes.ITEM, item)
      })
    }

    const images = queryAll(
      `.${this.classes.ITEM} ${this.options.imgSelector}`,
      this.element
    )

    if (images.length > 0) {
      images.forEach(image => {
        addClass(this.classes.IMG, image)
        let loader = ''
        if (this.options.loader) {
          loader = Loader.of(
            closest(this.options.imgContainer, image),
            this.options.loader
          )
          loader.show()
        }

        ImageLoader.of(image).on('loaded', img => {
          if (this.options.loader) {
            loader.hide()
          }
          addClass(this.classes.LOADED, closest(`.${this.classes.ITEM}`, img))
        })
      })
    }

    return items
  }

  buildContainer() {
    this.inner = find(`.${this.classes.INNER}`, this.element)

    if (!this.inner) {
      if (this.options.innerSelector) {
        this.inner = find(this.options.innerSelector, this.element)
        addClass(this.classes.INNER, this.$inner)
      } else {
        const itemsParent = parent(this.items[0])
        const inner = this.createEl('inner', {
          classes: this.classes
        })
        append(inner, itemsParent)
        this.inner = find(`.${this.classes.INNER}`, this.element)
        this.items.forEach(item => {
          append(item, this.inner)
        })
      }
    }
  }

  getItemInstances(items) {
    const itemWidth = this.getItemWidth()
    const itemHeight = '100%'

    const itemInstances = []

    items.forEach((item, index) => {
      const instanced = new Item(item)

      instanced.index = index
      instanced.setInfo({
        width: itemWidth,
        height: itemHeight
      })
      itemInstances.push(instanced)
    })

    return itemInstances
  }

  getItemWidth() {
    return (
      (parseFloat(getStyle('width', this.element)) -
        this.gutter * (this.itemNums - 1)) /
      this.itemNums
    )
  }

  computeItemLocation(itemInstances) {
    let width = 0

    itemInstances.forEach((item, index) => {
      const $item = item.el
      const info = item.info

      const config = {
        x: width,
        y: 0
      }

      if (this.options.multiple) {
        config.height =
          (parseFloat(getStyle('height', this.inner), 10) - this.gutter) / 2

        if (index % 2) {
          config.x = itemInstances[index - 1].info.x
          config.y = config.height + this.gutter
        }
      }

      item.setInfo(config)

      setStyle(
        {
          width: `${item.info.width}px`,
          height: '100%',
          transform: `translate3d(${config.x}px, ${config.y}px, 0)`
        },
        $item
      )

      if (this.options.multiple) {
        setStyle(
          {
            height: `${item.info.height}px`
          },
          $item
        )
        if (!(index % 2)) {
          width += itemInstances[index - 1]
            ? itemInstances[index - 1].info.width + this.gutter
            : item.info.width + this.gutter
        }
      } else {
        width += info.width + this.gutter
      }
    })

    width -= this.gutter

    this.setWidth(width)
  }

  setWidth(width) {
    setStyle('width', width, this.inner)
    this.innerWidth = width
  }

  getItemsBySort() {
    const itemInstancesClone = [].concat(this.itemInstances)
    const tempArr = []
    let offsetX

    itemInstancesClone.sort((prev, next) => prev.info.x - next.info.x)
    itemInstancesClone.forEach(item => {
      if (Math.floor(item.info.x) !== offsetX) {
        tempArr.push(item)
        offsetX = Math.floor(item.info.x)
      }
    })

    return tempArr
  }

  getMaxActiveCount() {
    if (this.options.group) {
      return Math.ceil(this.sortedItems.length / this.options.itemNums)
    }

    if (this.options.center) {
      return this.sortedItems.length
    }

    const maxWidth = this.innerWidth - this.width

    if (maxWidth <= 0) {
      return 1
    }

    let dotNum = 0
    let targetItem = this.sortedItems[0]

    for (const item of this.sortedItems) {
      if (item.info.x >= maxWidth) {
        break
      }

      dotNum++
      targetItem = item
    }

    if (Math.floor(targetItem.info.x) < Math.floor(maxWidth)) {
      dotNum += 1
    }

    return Math.max(1, dotNum)
  }

  buildPagination() {
    const that = this
    const pagination = this.createEl('pagination', {
      classes: this.classes
    })
    const items = []

    for (let index = 0; index < this.maxActiveCount; index++) {
      items.push({ index })
    }

    let config = {
      items,
      valueFrom: 'data-href',
      default: `${this.active}`,
      template: {
        item(css) {
          return `<li class="${css} ${
            that.classes.PAGINATIONITEM
          }" data-href="{index}"><a>{index}</a></li>`
        }
      }
    }

    append(pagination, this.wrapper)

    config = isPlainObject(this.options.pagination)
      ? Object.assign({}, config, this.options.pagination)
      : config

    this.pagination = Dots.of(
      find(`.${this.classes.PAGINATION}`, this.wrapper),
      config
    )
  }

  initSwipeable() {
    const that = this

    this.swipeable = Swipeable.of(this.inner, {
      container: that.element,
      power: 1,
      duration: that.options.duration,
      onStart() {
        if (that.anime) {
          that.anime.pause()
        }
        that.trigger(EVENTS.DRAGSTART)
      },
      onMove() {
        let posX = this.startPosition.x + this.info.deltaX
        const scrollMax = that.width - that.innerWidth
        const distance =
          (that.width - that.sortedItems[that.active].info.width) / 2
        const scrollMaxCenter = that.width - that.innerWidth - distance

        if (that.options.center) {
          if (posX > distance) {
            posX = Math.round(distance + (posX - distance) / 5)
          } else if (posX < scrollMaxCenter) {
            posX = Math.round(scrollMaxCenter + (posX - scrollMaxCenter) / 5)
          }
        } else if (posX > 0) {
          posX = Math.round(posX / 5)
        } else if (posX < scrollMax) {
          posX = Math.round(scrollMax + (posX - scrollMax) / 5)
        }

        setStyle(
          {
            transform: `translateX(${posX}px)`
          },
          this.element
        )
        this.position = { x: posX, y: 0 }
      },
      onSnail() {
        const locationX = this.getLocation(this.element).x
        const index = that.getIndexByDistance(locationX)
        that.moveTo(index)
        that.trigger(EVENTS.DRAGSNAIL)
      },
      onThrow() {
        const locationX = this.getLocation(this.element).x
        const throwDistance = this.getDecayDistance(this.info.velocityX)
        const distance = that.options.decay
          ? locationX + throwDistance
          : locationX
        let index = that.getIndexByDistance(distance)

        if (throwDistance < 0) {
          if (that.active !== that.maxActiveCount && index <= that.active) {
            index += 1
          }
        } else if (that.active !== 0 && index >= that.active) {
          index -= 1
        }

        that.moveTo(index)

        if (that.options.decay) {
          that.trigger(EVENTS.DRAGDECAY)
        } else {
          that.trigger(EVENTS.DRAGTHROW)
        }
      }
    })
  }

  computeWidthResize() {
    this.itemInstances.forEach(item => {
      const itemWidth = this.getItemWidth()

      item.setInfo({ width: itemWidth })
    })

    this.computeItemLocation(this.itemInstances)

    this.width = parseFloat(getStyle('width', this.element), 10)

    let distance = 0
    if (this.options.group) {
      distance =
        Math.max(
          0,
          Math.min(
            this.sortedItems[this.active].info.x,
            this.innerWidth - this.width
          )
        ) * this.options.itemNums
    } else {
      distance = this.sortedItems[this.active].info.x
    }

    if (
      this.active === this.maxActiveCount - 1 &&
      this.active !== 0 &&
      !this.options.center
    ) {
      distance = this.innerWidth - this.width
    }

    if (
      this.options.center &&
      !this.options.group &&
      this.options.itemNums > 1
    ) {
      const activeItemWidth = this.sortedItems[this.active].info.width
      distance -= (this.width - activeItemWidth) / 2
    }

    setStyle(
      {
        transform: `translateX(-${distance}px)`
      },
      this.inner
    )
  }

  buildArrows() {
    this.arrows = Arrows.of(this.element, this.options.arrows)
  }

  resize() {
    this.computeWidthResize()

    this.trigger(EVENTS.RESIZE)
  }

  bind() {
    if (this.options.arrows) {
      this.arrows.options.onNext = () => {
        this.next()
      }

      this.arrows.options.onPrev = () => {
        this.prev()
      }
    }

    if (this.options.pagination) {
      bindEvent(
        this.eventName('click'),
        `.${this.classes.PAGINATIONITEM}`,
        e => {
          const $item = parentWith(
            hasClass(this.classes.PAGINATIONITEM),
            e.target
          )
          const index = this.pagination.dots.indexOf($item)
          this.moveTo(index)
        },
        this.wrapper
      )
    }
  }

  unbind() {
    removeEvent(this.eventName(), this.wrapper)
  }

  next() {
    const step = 1
    const minIndex = this.options.loop ? 0 : this.active

    const active =
      this.active >= this.maxActiveCount - 1 ? minIndex : this.active + step

    this.moveTo(active, () => this.trigger(EVENTS.NEXT))
  }

  prev() {
    const step = 1
    const maxIndex = this.options.loop ? this.maxActiveCount - 1 : 0

    const active = this.active - step >= 0 ? this.active - step : maxIndex

    this.moveTo(active, () => this.trigger(EVENTS.PREV))
  }

  move(distance, details) {
    let { trigger, ease } = details
    const { callback } = details

    trigger = trigger || false
    ease = ease || 'linear'
    const duration = this.options.duration

    if (
      this.options.center &&
      !this.options.group &&
      this.options.itemNums > 1
    ) {
      const activeItemWidth = this.sortedItems[this.active].info.width
      distance -= (this.width - activeItemWidth) / 2
    }

    this.anime = anime({
      targets: this.inner,
      translateX: -distance,
      easing: ease,
      duration
    })

    if (this.arrows) {
      if (this.active === 0) {
        this.arrows.disable('prev')
        this.arrows.enable('next')
      } else if (this.active === this.maxActiveCount - 1) {
        this.arrows.disable('next')
        this.arrows.enable('prev')
      } else {
        this.arrows.enable()
      }
    }

    setTimeout(() => {
      if (callback) {
        callback()
      }

      if (trigger) {
        this.trigger(EVENTS.MOVEEND, this.active)
      }
    }, duration)
  }

  moveTo(index, callback) {
    let distance = 0
    if (index >= this.maxActiveCount) {
      index = this.maxActiveCount - 1
    }

    this.active = index

    if (this.options.group) {
      distance =
        Math.max(
          0,
          Math.min(this.sortedItems[index].info.x, this.innerWidth - this.width)
        ) * this.options.itemNums
    } else {
      distance = this.sortedItems[index].info.x
    }

    if (
      index === this.maxActiveCount - 1 &&
      index !== 0 &&
      !this.options.center
    ) {
      distance = this.innerWidth - this.width
    }

    if (this.options.pagination) {
      this.pagination.set(`${this.active}`)
    }

    if (!this.options.group) {
      this.itemInstances.forEach((item, index) => {
        const $item = item.$el
        removeClass(this.classes.ACTIVE, $item)
        if (index === this.active) {
          addClass(this.classes.ACTIVE, $item)
        }
      })
    }

    this.move(distance, {
      trigger: true,
      ease: 'linear',
      callback
    })
  }

  getIndexByDistance(distance) {
    distance = -distance
    let min = 0
    let max = this.innerWidth - this.width
    let add = 0

    if (this.options.center) {
      add = (this.width - this.itemInstances[this.active].info.width) / 2

      min += add
      max += add
    }

    if (distance <= -min) {
      return 0
    }

    if (distance >= max) {
      return this.maxActiveCount - 1
    }

    if (this.options.group && !this.options.center) {
      let index = 0
      const tempWidth = this.width
      const maybeIndex = Math.ceil(distance / this.width)

      index =
        distance - (maybeIndex - 1) * tempWidth > tempWidth / 2
          ? maybeIndex
          : maybeIndex - 1
      return Math.max(0, Math.min(index, this.maxActiveCount))
    }

    const tempArr = [].concat(this.sortedItems)
    let offsetX
    let index

    for (let i = 0; i < tempArr.length; i++) {
      const item = tempArr[i]
      const tempCount = Math.abs(item.info.x - distance - add)
      if (i === 0) {
        offsetX = tempCount
        index = 0
        continue
      }

      if (tempCount < offsetX) {
        offsetX = tempCount
        index = i
      }
    }

    return index
  }

  createEl(name, opts) {
    return templateEngine.compile(this.options.templates[name]())(opts)
  }

  setPagination(num, active = this.active) {
    const items = []
    this.pagination.empty()

    for (let index = 0; index < num; index++) {
      items.push({ index })
    }

    this.pagination.load(items, true)

    if (active >= items.length) {
      active = items.length - 1
    }

    this.pagination.set(`${active}`)
    this.moveTo(active)
  }

  setHeight(height) {
    setStyle('paddingBottom', `${height}%`, this.element)
  }

  getLocationX(el) {
    const transform = getStyle('transform', el)
    if (transform === 'none') {
      return 0
    }

    return parseInt(transform.split(',')[4], 10)
  }

  getDots() {
    if (this.options.group) {
      return this.maxActiveCount
    }

    let dotNum = 0
    const maxWidth = this.innerWidth - this.width

    for (const item of this.sortedItems) {
      if (item.info.x >= maxWidth) {
        break
      }

      dotNum++
    }

    return dotNum
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
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

export default Swipe
