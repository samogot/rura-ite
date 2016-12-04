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
    UPDATE_LINES_HEIGHTS
    UPDATE_FULL_HEIGHT
    UPDATE_CLIENT_HEIGHT
    UPDATE_VIEWPORT
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
