import { query } from '@pluginjs/dom'
import Rate from '@pluginjs/rate'

const element = query('#fullStar .fullStar')
const api = Rate.of(element, {
  step: 1,
  max: 7,
  value: 4,
  iconSize: '26px',
  onChangeHoverScore: () => {
    const hoverScore = api.getHoverScore()
    const t = `score: ${hoverScore}`
    const value = document.querySelector('.fullStarscore')
    value.innerHTML = t
  },
  onMouseLeave: () => {
    const score = api.getScore()
    const t = `score: ${score}`
    const value = document.querySelector('.fullStarscore')
    value.innerHTML = t
  }
})
