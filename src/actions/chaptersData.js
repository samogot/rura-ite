import T from '../constants/ACTION_TYPES';


export function addChapter(data) {
  return {
    type: T.CHAPTERS_DATA.ADD,
    id: data.id,
    data,
  }
}

export function selectActiveChapter(id) {
  return {
    type: T.CHAPTERS_DATA.SELECT_ACTIVE,
    id: id
  }
}