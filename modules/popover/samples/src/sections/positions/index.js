import { html as render, query, queryAll } from '@pluginjs/dom'
import html from './index.html'
import Popover from '@pluginjs/popover'

queryAll('[data-toggle="popover"]', render(html, query('#positions'))).map(
  element =>
    Popover.of(element, {
      /** options **/
    })
)
