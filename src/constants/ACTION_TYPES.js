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
    SCROLL_SET
    SCROLL_LINE
    SCROLL_PARAGRAPH
    SCROLL_SYNC
    UPDATE_LINES_HEIGHTS
    UPDATE_CLIENT_HEIGHT
    UPDATE_OFFSETS
    RECALC_SYNCED_TEXTS
    RECALC_ALIGNED_TEXT_SETS
    RECALC_LINE_MERGES
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
