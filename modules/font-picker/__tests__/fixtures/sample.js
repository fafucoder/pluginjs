import { parseHTML } from '@pluginjs/dom'

export default () =>
  parseHTML`<input type="text" class="font-picker-input" value='{"source":"google", "value":"Alfa Slab One"}'/>`
