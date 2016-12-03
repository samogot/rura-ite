import T from '../constants/ACTION_TYPES';


export function addChapter(data) {
  return {
    type: T.CHAPTERS_DATA.ADD,
    id: data.id,
    data,
  }
}
