import T from '../constants/ACTION_TYPES';


export function saveText(id, text) {
  return {
    type: T.TEXTS_DATA.UPDATE,
    id: id,
    data: {wiki: text},
  }
}

export function addText(data) {
  return {
    type: T.TEXTS_DATA.ADD,
    id: data.id,
    data,
  }
}

export function saveSourceMerges(id, merges) {
  return {
    type: T.TEXTS_DATA.UPDATE,
    id: id,
    data: {sourceMerges: merges},
  }
}