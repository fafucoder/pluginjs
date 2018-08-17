import { append } from '@pluginjs/dom'
import { deepMerge } from '@pluginjs/utils'
import THUMBS from '@pluginjs/thumbnails'

class Thumbs {
  constructor(instance) {
    this.instance = instance
    this.initialize()
  }

  initialize() {
    if (!this.instance.options.thumbs) {
      return
    }

    this.element = this.instance.getElement('thumbs')
    append(this.element, this.instance.footer)

    setTimeout(() => {
      this.initThumbs()
    }, 0)
  }

  initThumbs() {
    const instance = this.instance

    this.plugin = THUMBS.of(
      this.element,
      deepMerge(instance.options, {
        data: instance.processData(instance.data, 'thumb'),
        current: instance.active,
        mode: 'center',
        onChange() {
          instance.topbar.setCounter(this.current)
          instance.slider.plugin.go(this.current, false)

          if (instance.options.caption) {
            instance.caption.setInfo(instance.data[this.current])
          }
        }
      })
    )
  }
}

export default Thumbs
