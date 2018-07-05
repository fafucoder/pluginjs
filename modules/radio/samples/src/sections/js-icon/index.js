import { queryAll } from '@pluginjs/dom'
import Radio from '@pluginjs/radio'

queryAll('#js-icon input').forEach(element => {
  Radio.of(element, {
    classes: {
      icon: 'icon-check-mini'
    }
  })
})
