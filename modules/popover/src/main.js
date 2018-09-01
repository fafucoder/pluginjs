import templateEngine from '@pluginjs/template'
import { query } from '@pluginjs/dom'
import { removeClass, addClass } from '@pluginjs/classes'
import { bindEvent } from '@pluginjs/events'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  optionable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'
import Tooltip from '@pluginjs/tooltip'

/* Credit to bootstrap popover http://getbootstrap.com MIT */
@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class Popover extends Tooltip {
  constructor(element, options = {}) {
    super(element, options)
  }

  createTip() {
    let close = ''

    if (this.options.close) {
      close = templateEngine.render(this.options.templates.close.call(this), {
        classes: this.classes
      })
    }

    const title = templateEngine.render(
      this.options.templates.title.call(this),
      { classes: this.classes }
    )
    const content = templateEngine.render(
      this.options.templates.content.call(this),
      { classes: this.classes }
    )

    // const arrow = templateEngine.render(
    //   this.options.templates.arrow.call(this),
    //   { classes: this.classes }
    // )

    return templateEngine.render(this.options.template.call(this), {
      classes: this.classes,
      // arrow,
      close,
      title,
      content
    })
  }

  isWithContent() {
    return this.getTitle() || this.getContent()
  }

  getContent() {
    return (
      this.element.getAttribute('data-content') ||
      (typeof this.options.content === 'function'
        ? this.options.content.call(this.element)
        : this.options.content)
    )
  }

  setContent() {
    const $tip = this.getTip()

    // we use append for html objects to maintain js events
    const title = this.getTitle()
    const content = this.getContent()

    this.setElementContent(query(`.${this.classes.TITLE}`, $tip), title)
    this.setElementContent(query(`.${this.classes.CONTENT}`, $tip), content)

    if (this.options.arrow) {
      addClass(this.classes.ARROW, $tip)
    }

    removeClass(`${this.classes.SHOW} ${this.classes.FADE}`, $tip)

    // this.destroyPopper()
  }

  show() {
    super.show()

    if (this.options.close) {
      bindEvent(
        this.eventName('click'),
        () => {
          this.hide()
        },
        query(`.${this.classes.CLOSE}`, this.getTip())
      )
    }
  }
}

export default Popover
