import T from '../constants/ACTION_TYPES';


export function saveText(text) {
  return {
    type: T.TEXTS_DATA.UPDATE,
    id: 0,
    data: {text},
  }
}

export function addText(data) {
  return {
    type: T.TEXTS_DATA.ADD,
    id: data.id,
    data,
  }
}
