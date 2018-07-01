import { html as render, query } from '@pluginjs/dom'
import html from './index.html'
import Swipe from '@pluginjs/swipe'

const element = query('.swipe', render(html, query('#group')))
Swipe.of(element, {
  itemNums: 3,
  gutter: 20,
  group: true,
  pagination: true
})