import { query } from '@pluginjs/dom'
import Notice from '@pluginjs/notice'

const alignleft = query('#content-align .alignleft')
const aligncenter = query('#content-align .aligncenter')
alignleft.addEventListener('click', () => {
  Notice.show({
    content: 'Check Out And Download Premui Psd Template',
    contentAlignment: 'left'
  })
})
aligncenter.addEventListener('click', () => {
  Notice.show({
    content: 'Check Out And Download Premui Psd Template',
    contentAlignment: 'center'
  })
})