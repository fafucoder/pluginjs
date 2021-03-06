import anime from 'animejs'
import { setStyle } from '@pluginjs/styled'
import Char from './char'

export default class CharSlideDown extends Char {
  constructor(instance) {
    super(instance)
    setStyle(
      {
        overflow: 'hidden',
        'vertical-align': 'bottom'
      },
      this.element
    )
    this.setupAnime()
  }

  setupAnime() {
    const options = {
      targets: this.chars,
      translateY: [-100, 0],
      easing: 'easeOutExpo',
      duration: this.options.duration,
      delay(el, i) {
        return 60 * i
      }
    }

    anime
      .timeline({
        loop: this.options.loop || false
      })
      .add(options)
      .add({})
  }
}
