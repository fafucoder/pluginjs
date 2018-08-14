import template from '@pluginjs/template'
import {
  parseHTML,
  insertAfter,
  query,
  queryAll,
  closest,
  data
} from '@pluginjs/dom'
import { removeClass, addClass } from '@pluginjs/classes'
import { setStyle } from '@pluginjs/styled'
import { bindEvent } from '@pluginjs/events'

export default class Position {
  constructor(instance) {
    this.instance = instance
    this.values = instance.options.position.values
    this.defaultValue = instance.options.position.defaultValue

    this.initialize()
  }

  initialize() {
    const html = template.compile(this.instance.options.position.template())({
      classes: this.instance.classes,
      bgPosition: this.instance.translate('bgPosition')
    })

    this.$Position = parseHTML(html)
    insertAfter(this.$Position, this.instance.$imageWrap)

    this.$position = query(
      `.${this.instance.classes.POSITION}`,
      this.instance.$expandPanel
    )
    this.$items = queryAll('li', this.$position)
    this.values.forEach((value, key) => {
      // this.$items[key].dataset.position = value
      data('position', value, this.$items[key])
    })

    const value =
      typeof this.instance.value.position !== 'undefined'
        ? this.instance.value.position
        : this.defaultValue
    this.set(value)

    this.bind()
  }

  set(value) {
    let found = false
    this.$items.map(removeClass(this.instance.classes.ACTIVE))
    for (let i = 0; i < this.values.length; i++) {
      if (value === this.values[i]) {
        this.instance.value.position = value
        addClass(this.instance.classes.ACTIVE, this.$items[i])
        setStyle('background-position', value, this.instance.$image)
        setStyle('background-position', value, this.instance.$fillImage)
        found = true
      }
    }

    if (!found) {
      this.set(this.defaultValue)
    }
  }

  clear() {
    this.set(this.defaultValue)
  }

  bind() {
    bindEvent(
      {
        type: 'click',
        identity: { type: 'tagName', value: 'li' },
        handler: ({ target }) => {
          const el = target.tagName === 'LI' ? target : closest('li', target)
          if (this.instance.disabled) {
            return null
          }
          const value = data('position', el)
          this.set(value)
          // that.instance.update();
          return false
        }
      },
      this.$position
    )
  }
}
