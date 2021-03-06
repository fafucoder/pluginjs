import Component from '@pluginjs/component'
import templateEngine from '@pluginjs/template'
import {
  eventable,
  register,
  stateable,
  styleable,
  themeable,
  optionable,
  translateable
} from '@pluginjs/decorator'
import {
  classes as CLASSES,
  defaults as DEFAULTS,
  dependencies as DEPENDENCIES,
  translations as TRANSLATIONS,
  events as EVENTS,
  methods as METHODS,
  namespace as NAMESPACE
} from './constant'
import {
  isArray,
  isFunction,
  isNull,
  isPlainObject,
  isEmpty
} from '@pluginjs/is'
import Clearable from './clearable'
import Filterable from './filterable'
import Manage from './manage'
import Switcher from './switcher'
import Loading from './loading'
import { removeEvent } from '@pluginjs/events'
import { addClass, removeClass } from '@pluginjs/classes'
import Dropdown from '@pluginjs/dropdown'
import {
  query,
  insertAfter,
  appendTo,
  html,
  parseHTML,
  closest,
  empty
} from '@pluginjs/dom'
import { deepClone, each } from '@pluginjs/utils'
import Tooltip from '@pluginjs/tooltip'

@translateable(TRANSLATIONS)
@themeable()
@styleable(CLASSES)
@eventable(EVENTS)
@stateable()
@optionable(DEFAULTS, true)
@register(NAMESPACE, {
  methods: METHODS,
  dependencies: DEPENDENCIES
})
class IconPicker extends Component {
  constructor(element, options = {}) {
    super(element)

    this.setupOptions(options)
    this.setupClasses()
    this.setupStates()
    this.setupI18n()
    this.initialize()
  }

  initialize() {
    this.selected = null
    this.current = null

    this.placeholder = this.element.getAttribute('placeholder')
    if (!this.placeholder && this.options.placeholder) {
      if (this.options.placeholder === true) {
        this.placeholder = this.translate('placeholderText')
      } else {
        this.placeholder = this.options.placeholder
      }
    }

    addClass(this.classes.ELEMENT, this.element)

    this.$wrap = insertAfter(
      `<div class="${this.classes.WRAP}"></div>`,
      this.element
    )

    if (this.options.theme) {
      addClass(this.getThemeClass(), this.$wrap)
    }

    this.$trigger = appendTo(
      `<div class="${this.classes.TRIGGER}"></div>`,
      this.$wrap
    )

    this.$label = appendTo(
      templateEngine.render(this.options.templates.label(), {
        classes: this.classes,
        placeholder: this.placeholder
      }),
      this.$trigger
    )

    this.bind()

    this.initData()

    this.setupDropdown(this.options.dropdown)

    if (this.options.clearable) {
      this.CLEARABLE = new Clearable(this)
    }

    this.LOADING = new Loading(this)

    if (this.element.disabled || this.options.disabled) {
      this.disable()
    }

    this.enter('initialized')
    this.trigger(EVENTS.READY)
  }

  setupDropdown(options) {
    this.$dropdown = appendTo(
      templateEngine.render(this.options.templates.dropdown.call(this), {
        classes: this.classes
      }),
      this.$wrap
    )

    this.$main = query(`.${this.classes.MAIN}`, this.$dropdown)

    this.DROPDOWN = Dropdown.of(this.$trigger, {
      ...options,
      target: this.$dropdown,
      keyboard: this.options.keyboard ? this.$wrap : false,
      classes: {
        PLACEMENT: `${this.classes.NAMESPACE}-on-{placement}`
      },
      onShow: () => {
        if (this.is('loading')) {
          this.LOADING.show()
        }

        if (!this.is('builded')) {
          this.buildDropdown()
        }

        addClass(this.classes.SHOW, this.$wrap)
        this.trigger(EVENTS.SHOW)
      },
      onShown: () => {
        this.trigger(EVENTS.SHOWN)
        this.enter('shown')
      },
      onHide: () => {
        this.trigger(EVENTS.HIDE)
        this.leave('shown')
      },
      onHided: () => {
        removeClass(this.classes.SHOW, this.$wrap)
        this.trigger(EVENTS.HIDED)
      },
      onSelect: $item => {
        const $pack = closest(`.${this.classes.PACK}`, $item)
        const pack = this.getPack($pack.dataset.name)

        this.set({
          package: pack.name,
          icon: $item.dataset.value,
          class: pack.class,
          prefix: pack.prefix
        })
      }
    })
  }

  bind() {} // eslint-disable-line

  unbind() {
    removeEvent(this.eventName(), this.element)
  }

  buildDropdown() {
    if (this.options.manage) {
      this.MANAGE = new Manage(this)
    }

    if (this.data) {
      this.buildDropdownContent()
    }

    this.enter('builded')
  }

  initData() {
    if (isArray(this.options.source) || isPlainObject(this.options.source)) {
      this.resolveData(this.options.source)
    } else if (isFunction(this.options.source)) {
      this.enter('loading')
      this.options.source.call(this, this.resolveData.bind(this))
    }
  }

  resolveData(data) {
    this.data = deepClone(data)

    if (!isArray(this.data)) {
      this.data = [this.data]
    }

    if (this.data.length < 1) {
      return
    }

    const value = this.element.value

    if (!isEmpty(value)) {
      this.set(this.options.parse.call(this, value), false)
    }

    if (isNull(this.current)) {
      this.setCurrentPack(this.data[0].name)
    }

    if (this.is('loading')) {
      if (this.LOADING) {
        this.LOADING.hide()
      }

      this.leave('loading')
    }

    if (this.is('builded') || this.is('shown')) {
      this.buildDropdownContent()
    }
  }

  set(item, trigger = true) {
    if (item !== this.selected) {
      if (this.selected) {
        if (this.DROPDOWN) {
          this.DROPDOWN.unselectByValue(this.getItemValue(this.selected), false)
        }
      }
      if (isNull(item)) {
        this.setLabel(this.placeholder)
        removeClass(this.classes.SELECTED, this.$wrap)

        if (trigger) {
          this.trigger(EVENTS.CLEAR)
        }
      } else {
        this.setLabel(this.getItemLabel(item))
        addClass(this.classes.SELECTED, this.$wrap)

        if (trigger) {
          this.trigger(EVENTS.SELECT, item)
        }
      }

      this.selected = item
      let value
      if (item) {
        if (item.package) {
          this.setCurrentPack(item.package)
        }

        value = this.options.process.call(this, item)
      } else {
        value = ''
      }

      if (value !== this.element.value) {
        this.element.value = value

        if (trigger) {
          this.trigger(EVENTS.CHANGE, value)
        }
      }
    }
  }

  val(value) {
    if (typeof value === 'undefined') {
      return this.options.process.call(this, this.get())
    }
    return this.set(this.options.parse.call(this, value))
  }

  get() {
    if (this.selected) {
      return this.selected
    }
    return null
  }

  clear() {
    this.set(null)
  }

  getItemLabel(item) {
    return templateEngine.render(this.options.templates.selected.call(this), {
      classes: this.classes,
      icon: this.getItemIcon(item),
      value: item.icon
    })
  }

  getCurrentPack() {
    return this.current
  }

  setCurrentPack(name) {
    const pack = this.getPack(name)

    if (pack) {
      this.current = pack
    } else {
      this.current = this.data.length > 0 ? this.data[0] : null
    }
  }

  switchPack(name) {
    if (name !== this.current.name) {
      if (this.FILTERABLE) {
        this.FILTERABLE.refreshDefault()
      }
      addClass(this.classes.PACKHIDED, this.current.__dom)

      const pack = this.getPack(name)
      if (!pack.__dom) {
        pack.__dom = this.buildPack(pack)
      } else {
        removeClass(this.classes.PACKHIDED, pack.__dom)
      }

      this.$main.scrollTop = 0
      this.setCurrentPack(name)
    }
  }

  getPack(name) {
    return this.data.find(pack => pack.name === name)
  }

  getPacks() {
    return this.data
  }

  getCurrentPackItems() {
    if (this.current && this.current.__items) {
      return this.current.__items
    }
    return []
  }

  getItemValue(item) {
    return item.icon
  }

  setLabel(label) {
    html(label, this.$label)
  }

  selectForDropdown() {
    if (this.selected) {
      this.DROPDOWN.selectByValue(this.getItemValue(this.selected), false)
    }
  }

  buildDropdownContent() {
    if (this.data.length > 1 && !this.SWITCHER) {
      this.SWITCHER = new Switcher(this)
    }

    if (this.options.filterable && !this.FILTERABLE) {
      this.FILTERABLE = new Filterable(this)
    }

    this.buildPack(this.getCurrentPack())

    this.selectForDropdown()
  }

  buildPack(pack) {
    if (!this.packTemplate) {
      this.packTemplate = templateEngine.compile(
        this.options.templates.pack.call(this)
      )
    }

    const $pack = parseHTML(
      this.packTemplate({
        classes: this.classes,
        pack
      })
    )

    pack.__dom = $pack
    pack.__items = {}

    if (pack.classifiable === false) {
      each(pack.icons, (name, label) => {
        $pack.appendChild(this.buildItem(pack, name, label))
      })
    } else {
      each(pack.categories, (category, icons) => {
        $pack.appendChild(this.buildGroup(pack, category, icons))
      })
    }

    this.$main.appendChild($pack)

    return $pack
  }

  buildGroup(pack, group, icons) {
    if (!this.groupTemplate) {
      this.groupTemplate = templateEngine.compile(
        this.options.templates.group.call(this)
      )
    }

    const $group = parseHTML(
      this.groupTemplate({
        classes: this.classes,
        group
      })
    )

    pack.__items[group] = {
      group,
      items: {},
      $dom: $group
    }

    icons.forEach(icon => {
      if (Object.prototype.hasOwnProperty.call(pack.icons, icon)) {
        $group.appendChild(this.buildItem(pack, icon, pack.icons[icon], group))
      }
    })

    return $group
  }

  buildItem(pack, value, label, group) {
    if (!this.itemTemplate) {
      this.itemTemplate = templateEngine.compile(
        this.options.templates.item.call(this)
      )
    }

    const $item = parseHTML(
      this.itemTemplate({
        classes: this.classes,
        icon: this.getItemIcon({
          class: pack.class,
          prefix: pack.prefix,
          icon: value
        }),
        value,
        label
      })
    )

    if (group) {
      pack.__items[group].items[value] = {
        icon: value,
        $dom: $item
      }
    } else {
      pack.__items[value] = {
        icon: value,
        $dom: $item
      }
    }

    Tooltip.of($item, {
      ...this.options.tooltip
    })

    return $item
  }

  getItemIcon(item) {
    if (!this.iconTemplate) {
      this.iconTemplate = templateEngine.compile(
        this.options.templates.icon.call(this)
      )
    }

    return this.iconTemplate({
      item
    })
  }

  getActions() {
    if (!this.$actions) {
      this.$actions = insertAfter(
        `<div class="${this.classes.ACTIONS}"></div>`,
        this.$main
      )
    }
    return this.$actions
  }

  manage() {
    if (isFunction(this.options.manage)) {
      this.options.manage.call(this, this.resolveManage.bind(this))
    }
  }

  resolveManage(data) {
    if (data) {
      if (this.FILTERABLE) {
        this.FILTERABLE.refreshDefault()
      }

      empty(this.$main)
      if (this.SWITCHER) {
        this.SWITCHER.destroy()
        this.SWITCHER = null
      }

      this.resolveData(data)
    }
  }

  enable() {
    if (this.is('disabled')) {
      this.DROPDOWN.enable()
      removeClass(this.classes.DISABLED, this.$wrap)
      this.leave('disabled')
    }
    this.trigger(EVENTS.ENABLE)
  }

  disable() {
    if (!this.is('disabled')) {
      this.DROPDOWN.disable()
      addClass(this.classes.DISABLED, this.$wrap)
      this.enter('disabled')
    }

    this.trigger(EVENTS.DISABLE)
  }

  destroy() {
    if (this.is('initialized')) {
      this.unbind()

      if (this.CLEARABLE) {
        this.CLEARABLE.destroy()
      }
      if (this.options.theme) {
        removeClass(this.getThemeClass(), this.$wrap)
      }
      this.$wrap.remove()
      removeClass(this.classes.ELEMENT, this.element)
      this.leave('initialized')
    }

    this.trigger(EVENTS.DESTROY)
    super.destroy()
  }
}

export default IconPicker
