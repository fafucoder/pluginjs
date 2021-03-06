import { query } from '@pluginjs/dom'
import SvgProgress from '@pluginjs/svg-progress'

const element = query('#semicircle .pj-svgProgress-semicircle')
const instance = SvgProgress.of(element, {
  shape: 'semicircle'
})

setTimeout(() => {
  instance.start()
}, 2000)
