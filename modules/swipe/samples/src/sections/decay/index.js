import { query } from '@pluginjs/dom'
import Swipe from '@pluginjs/swipe'

const element = query('#decay .swipe')
Swipe.of(element, {
  itemNums: 3,
  gutter: 20,
  decay: true,
  pagination: {
    type: 'square light'
  }
})
