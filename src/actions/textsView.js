import T from '../constants/ACTION_TYPES';


export function selectActiveChapter(id) {
  return {
    type: T.TEXTS_VIEW.SELECT_CHAPTER,
    chapter: id
  }
}