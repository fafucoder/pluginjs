import { query } from '@pluginjs/dom'
import Select from '@pluginjs/select'
const sources = [
  {
    group: 'true',
    label: 'group-one',
    options: [
      {
        value: 'a',
        label: 'beijing',
        slug: 'beijing'
      },
      {
        value: 'b',
        label: 'nanjing',
        slug: 'nanjing'
      }
    ]
  },
  {
    group: 'true',
    label: 'group-two',
    options: [
      {
        value: 'c',
        label: 'fujian',
        slug: 'fujian'
      },
      {
        value: 'd',
        label: 'guangdong',
        slug: 'guangdong'
      }
    ]
  }
]
const element = query('#default .example-default')

Select.of(element, {
  source(buildList) {
    return buildList(sources)
  }
})
