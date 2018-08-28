import { queryAll } from '@pluginjs/dom'
import Hotspots from '@pluginjs/hotspots'

queryAll('#icon-skin .pj-hotspots').map(element =>
  Hotspots.of(element, {
    icon: 'icon icon-add',
    data: [
      {
        placement: 'top',
        title: '18" wheels',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        position: ['61%', '68%'],
        skin: 'light shadow solid'
      },
      {
        placement: 'right',
        title: 'TFSI® engine',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        position: ['35%', '45%'],
        skin: 'light solid'
      },
      {
        placement: 'right',
        title: 'LED Headlights',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        position: ['38%', '55%'],
        skin: 'light bordered'
      },
      {
        placement: 'right',
        title: 'Singleframe® grille',
        content:
          'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor.',
        position: ['27%', '60%'],
        skin: 'light'
      }
    ]
  })
)
