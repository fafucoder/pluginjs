import { queryAll } from '@pluginjs/dom'
import Reveal from '@pluginjs/reveal'

const elements = queryAll('#animation .reveal')
elements.forEach(el =>
  Reveal.of(el, {
    animation: 'bounceInDown',
    duration: '1000'
  })
)