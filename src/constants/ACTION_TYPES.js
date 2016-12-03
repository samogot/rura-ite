import defineActionTypes from '../utils/defineActionTypes';

export default defineActionTypes({
  /*
   * View model
   */

  LAYOUT_VIEW: `
    SAVE_LAYOUT
  `,

  TEXTS_VIEW: `
    SELECT_CHAPTER
    SYNC_SCROLL
    SET_SCROLL
    UPDATE_LINES_HEIGHTS
    UPDATE_OFFSETS
  `,

  /*
   * Data model
   */

  TEXTS_DATA: `
    UPDATE
    ADD
    REMOVE
  `,

  CHAPTERS_DATA: `
    UPDATE
    ADD
    REMOVE
  `,
})
