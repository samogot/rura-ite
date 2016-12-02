import defineActionTypes from '../utils/defineActionTypes';

export default defineActionTypes({
  /*
   * View model
   */

  LAYOUT_VIEW: `
    SAVE_LAYOUT
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
    SELECT_ACTIVE
  `,
})
