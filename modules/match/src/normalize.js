import { isString } from '@pluginjs/is'

const DIACRITICS = {
  a: 'aàáâãäåæāăąǎǟǡǻȁȃȧɐɑɒͣаӑӓᵃᵄᶏḁẚạảấầẩẫậắằẳẵặₐⱥａ',
  A: 'AÀÁÂÃÄÅĀĂĄǍǞǠǺȀȂȦȺАӐӒᴀᴬḀẠẢẤẦẨẪẬẮẰẲẴẶＡ',

  b: 'bƀƃɓᖯᵇᵬᶀḃḅḇｂ',
  B: 'BƁƂɃʙᛒᴃᴮᴯḂḄḆＢ',

  c: 'cçćĉċčƈȼɕͨᴄᶜḉↄｃ',
  C: 'CÇĆĈĊČƇȻʗḈＣ',

  d: 'dďđƋƌȡɖɗͩᵈᵭᶁᶑḋḍḏḑḓｄ',
  D: 'DĎĐƉƊᴰḊḌḎḐḒＤ',

  e: 'eèéêëēĕėęěǝȅȇȩɇɘͤᵉᶒḕḗḙḛḝẹẻẽếềểễệₑｅ',
  E: 'EÈÉÊËĒĔĖĘĚŒƎƐȄȆȨɆɛɜɶЄЭэєӬӭᴇᴈᴱᴲᵋᵌᶓᶔᶟḔḖḘḚḜẸẺẼẾỀỂỄỆＥ𐐁𐐩',

  f: 'fƒᵮᶂᶠḟｆ',
  F: 'FƑḞⅎＦ',

  g: 'gĝğġģǥǧǵɠɡᵍᵷᵹᶃᶢḡｇ',
  G: 'GĜĞĠĢƓǤǦǴɢʛᴳḠＧ',

  h: 'hĥħƕȟɥɦʮʯʰʱͪҺһᑋᶣḣḥḧḩḫⱨｈ',
  H: 'HĤĦȞʜᕼᚺᚻᴴḢḤḦḨḪⱧＨ',

  i: 'iìíîïĩīĭįǐȉȋɨͥᴉᵎᵢᶖᶤḭḯỉịｉ',
  I: 'IÌÍÎÏĨĪĬĮİǏȈȊɪІᴵᵻᶦᶧḬḮỈỊＩ',

  j: 'jĵǰɉʝʲᶡᶨｊ',
  J: 'JĴᴊᴶＪ',

  k: 'kķƙǩʞᵏᶄḱḳḵⱪｋ',
  K: 'KĶƘǨᴷḰḲḴⱩＫ',

  l: 'lĺļľŀłƚȴɫɬɭˡᶅᶩᶪḷḹḻḽℓⱡ',
  L: 'LĹĻĽĿŁȽʟᴌᴸᶫḶḸḺḼⱠⱢ',

  m: 'mɯɰɱͫᴟᵐᵚᵯᶆᶬᶭḿṁṃ㎡㎥ｍ',
  M: 'MƜᴍᴹḾṀṂＭ',

  n: 'nñńņňŉƞǹȵɲɳᵰᶇᶮᶯṅṇṉṋⁿｎ',
  N: 'NÑŃŅŇƝǸȠɴᴎᴺᴻᶰṄṆṈṊＮ',

  o: 'oòóôõöøōŏőơǒǫǭǿȍȏȫȭȯȱɵͦоӧөᴏᴑᴓᴼᵒᶱṍṏṑṓọỏốồổỗộớờởỡợₒｏ𐐬',
  O: 'OÒÓÔÕÖØŌŎŐƟƠǑǪǬǾȌȎȪȬȮȰОӦӨṌṎṐṒỌỎỐỒỔỖỘỚỜỞỠỢＯ𐐄',

  p: 'pᵖᵱᵽᶈṕṗｐ',
  P: 'PƤᴘᴾṔṖⱣＰ',

  q: 'qɋʠᛩｑ',
  Q: 'QɊＱ',

  r: 'rŕŗřȑȓɍɹɻʳʴʵͬᵣᵲᶉṙṛṝṟ',
  R: 'RŔŖŘƦȐȒɌʀʁʶᚱᴙᴚᴿṘṚṜṞⱤ',

  s: 'sśŝşšșʂᔆᶊṡṣṥṧṩｓ',
  S: 'SŚŜŞŠȘȿˢᵴṠṢṤṦṨＳ',

  t: 'tţťŧƫƭțʇͭᵀᵗᵵᶵṫṭṯṱẗｔ',
  T: 'TŢŤƬƮȚȾᴛᵀṪṬṮṰＴ',

  u: 'uùúûüũūŭůűųưǔǖǘǚǜȕȗͧߎᵘᵤṳṵṷṹṻụủứừửữựｕ',
  U: 'UÙÚÛÜŨŪŬŮŰŲƯǓǕǗǙǛȔȖɄᴜᵁᵾṲṴṶṸṺỤỦỨỪỬỮỰＵ',

  v: 'vʋͮᵛᵥᶹṽṿⱱｖⱴ',
  V: 'VƲɅʌᴠᶌṼṾＶ',

  w: 'wŵʷᵂẁẃẅẇẉẘⱳｗ',
  W: 'WŴʍᴡẀẂẄẆẈⱲＷ',

  x: 'x͓̽ᶍͯẋẍₓｘ',
  X: 'XˣͯẊẌ☒✕✖✗✘Ｘ',

  y: 'yýÿŷȳɏʸẏỳỵỷỹｙ',
  Y: 'YÝŶŸƳƴȲɎʎʏẎỲỴỶỸＹ',

  z: 'zźżžƶȥɀʐʑᙆᙇᶻᶼᶽẑẓẕⱬｚ',
  Z: 'ZŹŻŽƵȤᴢᵶẐẒẔⱫＺ'
}

function replaceDiacritics(char) {
  const normalized = Object.keys(DIACRITICS).find(i => {
    return DIACRITICS[i].indexOf(char) !== -1
  })

  if (normalized) {
    return normalized
  }
  return char
}

export default function normalize(input) {
  if (!isString(input)) {
    return input
  }

  return input.replace(/[^\u0000-\u007e]/g, char => { // eslint-disable-line
    return replaceDiacritics(char)
  })
}
