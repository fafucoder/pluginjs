import { isString, isArray } from '@pluginjs/is'

export const namespace = 'cascader'

export const events = {
  READY: 'ready',
  ENABLE: 'enable',
  DISABLE: 'disable',
  DESTROY: 'destroy',
  SELECT: 'select',
  UNSELECT: 'unselect',
  CHANGE: 'change',
  HIDE: 'hide',
  HIDED: 'hided',
  SHOW: 'show',
  SHOWN: 'shown',
  CLEAR: 'clear',
  FILTER: 'filter'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  ELEMENT: '{namespace}-element',
  TRIGGER: '{namespace}-trigger pj-input',
  LABEL: '{namespace}-label',
  WRAP: '{namespace}',
  SHOW: '{namespace}-show',
  DROPDOWN: '{namespace}-dropdown',
  OPTION: '{namespace}-option pj-dropdown-item',
  OPTIONEXTENSIBLE: '{namespace}-option-extensible',
  OPTIONDISABLED: '{namespace}-option-disabled pj-dropdown-item-disabled',
  SELECTED: '{namespace}-selected',
  DISABLED: '{namespace}-disabled',
  CLEARABLE: '{namespace}-clearable',
  CLEAR: '{namespace}-clear',
  FILTERABLE: '{namespace}-filterable',
  FILTER: '{namespace}-filter',
  NOTFOUND: '{namespace}-not-found',
  MENU: '{namespace}-menu'
}

export const methods = [
  'set',
  'get',
  'val',
  'clear',
  'enable',
  'disable',
  'destroy'
]

export const defaults = {
  theme: null,
  source: null,
  value: null,
  placeholder: 'Please Select',
  filterable: false,
  filter(option, search) {
    return option.label.toLowerCase().includes(search.toLowerCase())
  },
  keyboard: true,
  clearable: false,
  dropdown: {
    placement: 'bottom-start' // top
  },
  optionLabel(option) {
    return option.label
  },
  customLabel(labels) {
    return labels.join(' / ')
  },
  templates: {
    label() {
      return '<div class="{classes.LABEL}">{placeholder}</div>'
    },
    menu() {
      return '<div class="{classes.MENU}" data-level="{level}"></div>'
    },
    option() {
      return '<div class="{classes.OPTION}" data-value="{option.value}">{option.label}</div>'
    }
  },
  parse(value) {
    if (isString(value)) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return []
      }
    }
    return []
  },
  process(value) {
    if (value && isArray(value) && value.length !== 0) {
      return JSON.stringify(value)
    }
    return ''
  }
}

export const translations = {
  en: {
    notFoundText: 'No results found'
  },
  zh: {
    notFoundText: '无匹配数据'
  }
}

export const dependencies = ['dropdown']