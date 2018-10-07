import { query } from '@pluginjs/dom'
import FontPicker from '@pluginjs/font-picker'
import WebFont from 'webfontloader'

const source = {
  name: 'google',
  title: 'Google',
  icon: 'pj-icon pj-icon-google',
  fonts: [
    'Open Sans',
    'Roboto',
    'Lato',
    'Slabo 27px',
    'Oswald',
    'Source Sans Pro',
    'Montserrat',
    'PT Sans',
    'Raleway',
    'Lora'
  ],
  load($item, fontFamily, text) {
    WebFont.load({
      google: {
        families: [fontFamily],
        text
      }
    })

    $item.style.fontFamily = fontFamily
  }
}

const element = query('#ajax .example')
FontPicker.of(element, {
  source(resolve) {
    setTimeout(() => {
      resolve(source)
    }, 1000)
  }
})
