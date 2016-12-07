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
    SET_SCROLL
    SCROLL_LINE
    SCROLL_PARAGRAPH
    SYNC_SCROLL
    UPDATE_LINES_HEIGHTS
    UPDATE_CLIENT_HEIGHT
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

  CONFIG_DATA: `
    SAVE_SCROLL_CONFIG
  `,
})
