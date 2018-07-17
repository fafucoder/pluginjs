import is from '@pluginjs/is'

export const namespace = 'galleryPicker'

export const events = {
  READY: 'ready',
  ENABLE: 'enable',
  DISABLE: 'disable',
  DESTROY: 'destroy',
  CHANGE: 'change'
}

export const classes = {
  NAMESPACE: `pj-${namespace}`,
  THEME: '{namespace}--{theme}',
  DISABLED: '{namespace}-disabled',
  ACTIVE: '{namespace}-active',
  EMPTY: '{namespace}-empty',
  EXIST: '{namespace}-exist',
  EXPAND: '{namespace}-expand',
  HOVER: '{namespace}-hover',
  INFO: '{namespace}-info',
  INFOEDIT: '{namespace}-info-edit',
  INFOREMOVE: '{namespace}-info-remove',
  INFOIMAGE: '{namespace}-info-image',
  INFOCOUNT: '{namespace}-info-count',
  INFOADD: '{namespace}-info-add',
  INFOEXPAND: '{namespace}-info-expand',
  EXPANDCANCELBTN: '{namespace}-expand-cancel-btn',
  EXPANDSAVEBTN: '{namespace}-expand-save-btn',
  EXPANDADDBTN: '{namespace}-expand-add-btn',
  EXPANDADD: '{namespace}-expand-add',
  EXPANDPANEL: '{namespace}-expand-panel',
  EXPANDITEM: '{namespace}-expand-items',
  EXPANDCONTROL: '{namespace}-expand-control',
  ITEM: '{namespace}-item',
  ITEMIMAGE: '{namespace}-item-image',
  ITEMREMOVE: '{namespace}-item-remove',
  ITEMRESELECT: '{namespace}-item-reselect',
  INITIAL: '{namespace}-initial'
}

export const methods = [
  'val',
  'get',
  'set',
  'clear',
  'remove',
  'change',
  'add',
  'enable',
  'disable',
  'destroy'
]

export const defaults = {
  theme: null,
  locale: 'en',
  localeFallbacks: true,
  viewportSize: '330',
  disabled: false,

  templates: {
    main() {
      return (
        '<div class="{classes.NAMESPACE}">' +
        '<div class="{classes.INITIAL}">' +
        '<i class="icon-image-group"></i>{placeholder}' +
        '</div>' +
        '<div class="{classes.INFO}">' +
        '<div class="{classes.INFOIMAGE}" style=""></div>' +
        '<span class="{classes.INFOCOUNT}">{count}</span>' +
        '<div class="{classes.INFOEXPAND}"><i class="{classes.INFOEDIT} icon-pencil-square"></i><i class="{classes.INFOREMOVE} icon-trash"></i></div>' +
        '</div>' +
        '<div class="{classes.EXPANDPANEL}">' +
        '<ul class="{classes.EXPANDITEM}">' +
        '<li class="{classes.EXPANDADD}">' +
        '<i class="icon-picture"></i>{add}' +
        '</li>' +
        '</ul>' +
        '<div class="{classes.EXPANDCONTROL}">' +
        '<button class="{classes.EXPANDCANCELBTN} pj-btn pj-btn-transparent">{footerCancel}</button>' +
        // '<button class="{namespace}-expand-add-btn pj-btn pj-btn-outline-default">{footerAdd}</button>' +
        '<button class="{classes.EXPANDSAVEBTN} pj-btn pj-btn-primary">{footerSave}</button>' +
        '</div>' +
        '</div>' +
        '</div>'
      )
    },
    image() {
      return `<li class='{classes.ITEM}'>
        <div class="{classes.ITEMIMAGE}" style="background-image:url({imgSrc})" />
        <div class='{changeClass}'>
          <i class='{reselectClass} icon-repeat'></i>
          <i class='{removeClass} icon-trash'></i>
        </div>
      </li>`
    }
  },

  process(value) {
    if (value && !is.undefined(value)) {
      return value.join(',')
    }
    return ''
  },

  parse(value) {
    if (is.string(value) && value.length !== 0) {
      let array = []
      array = value.split(',')
      return array
    }
    return []
  },

  getImage(value) {
    return value
  },
  change() {
    return false // return an image url;
  },

  add() {
    return false // return an array of image url list;
  }
}

export const dependencies = ['scrollable', 'pop-dialog']

export const translations = {
  en: {
    placeholder: 'Add images',
    count: 'zero',
    // add: 'Add image',
    expand: 'expand',
    change: 'change',
    deleteTitle: 'Are you sure you want to delete?',
    cancel: 'Cancel',
    delete: 'Delete',
    add: 'Add',
    save: 'Save'
  },
  zh: {
    placeholder: '点击添加',
    count: '零',
    // add: '添加图片',
    expand: '展开',
    change: '更换图片',
    deleteTitle: '你确定要删除？',
    cancel: '取消',
    delete: '删除',
    add: '添加',
    save: '保存'
  }
}
