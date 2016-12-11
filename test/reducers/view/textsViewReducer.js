import expect from 'expect';
import reducers from '../../../src/reducers';

describe('textsViewReducer.js', () => {
  context('RECALC_LINE_MERGES', () => {

    it('should handle no merges', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {id: 3, sourceMerges: []}
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([]);
    });

    it('should handle one simpe two-way unmerge with src propagation', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 2}, '3': {from: 1, to: 3}}
      ]);
    });

    it('should handle one simpe two-way unmerge with dst propagation', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {id: 3, sourceMerges: []}
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 3}}
      ]);
    });

    it('should handle one simpe two-way merge with src propagation', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
      ]);
    });

    it('should handle one simpe two-way merge with dst propagation', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              },
              '3': {id: 3, sourceMerges: []}
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 2}, '3': {from: 1, to: 2}}
      ]);
    });

    it('should handle one complex two-way merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2},
                  {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3}]
              },
              '3': {id: 3, sourceMerges: []}
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 4}, '2': {from: 1, to: 3}, '3': {from: 1, to: 3}}
      ]);
    });

    it('should handle complex lang tree propagation', () => {
      /*
       * 1 2
       *  3   4    5   6
       *    7        8
       *    |-->9
       *       10
       */
      let state;
      state = reducers({
          view: {
            texts: {
              syncData: {
                syncedTexts: {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10}
              }
            }
          },
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {id: 3, sourceMerges: []},
              '4': {id: 4, sourceMerges: []},
              '5': {id: 5, sourceMerges: []},
              '6': {id: 6, sourceMerges: []},
              '7': {
                id: 7, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '8': {id: 8, sourceMerges: []},
              '9': {id: 9, sourceMerges: []},
              '10': {id: 10, sourceMerges: []},
            },
            config: {srcLang: {'1': 3, '2': 3, '3': 7, '4': 7, '5': 8, '6': 8, '7': 9, '8': 9, '9': 10, '10': null}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {
          '1': {from: 1, to: 3},
          '2': {from: 1, to: 3},
          '3': {from: 1, to: 3},
          '4': {from: 1, to: 3},
          '5': {from: 1, to: 2},
          '6': {from: 1, to: 2},
          '7': {from: 1, to: 3},
          '8': {from: 1, to: 2},
          '9': {from: 1, to: 2},
          '10': {from: 1, to: 2},
        }
      ]);
    });

    it('should handle complex lang tree propagation with loop', () => {
      /*
       * 1 2
       *  3   4    5   6<--|
       *    7        8     | - loop >_<
       *    |-->9          |
       *       10----------|
       */
      let state;
      state = reducers({
          view: {
            texts: {
              syncData: {
                syncedTexts: {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10}
              }
            }
          },
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {id: 3, sourceMerges: []},
              '4': {id: 4, sourceMerges: []},
              '5': {id: 5, sourceMerges: []},
              '6': {id: 6, sourceMerges: []},
              '7': {
                id: 7, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '8': {id: 8, sourceMerges: []},
              '9': {id: 9, sourceMerges: []},
              '10': {id: 10, sourceMerges: []},
            },
            config: {srcLang: {'1': 3, '2': 3, '3': 7, '4': 7, '5': 8, '6': 8, '7': 9, '8': 9, '9': 10, '10': 6}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {
          '1': {from: 1, to: 3},
          '2': {from: 1, to: 3},
          '3': {from: 1, to: 3},
          '4': {from: 1, to: 3},
          '5': {from: 1, to: 2},
          '6': {from: 1, to: 2},
          '7': {from: 1, to: 3},
          '8': {from: 1, to: 2},
          '9': {from: 1, to: 2},
          '10': {from: 1, to: 2},
        }
      ]);
    });

    it('should handle two simpe two-way merges from one source', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
                  {srcFrom: 5, srcTo: 7, dstFrom: 6, dstTo: 7}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 2}, '3': {from: 1, to: 3}},
        {'1': {from: 5, to: 7}, '2': {from: 5, to: 7}, '3': {from: 6, to: 7}}
      ]);
    });

    it('should handle two simpe two-way merges from different sources', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 8, srcTo: 9, dstFrom: 8, dstTo: 10}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 8, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 8}, '2': {from: 1, to: 8}, '3': {from: 1, to: 2}},
        {'1': {from: 8, to: 9}, '2': {from: 8, to: 10}, '3': {from: 2, to: 4}}
      ]);
    });

    it('should handle correct order in multi language', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 3, srcTo: 4, dstFrom: 3, dstTo: 5}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 8}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 8, srcTo: 9, dstFrom: 8, dstTo: 10}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 2}, '3': {from: 1, to: 8}, '4': {from: 1, to: 8}},
        {'1': {from: 2, to: 3}, '2': {from: 2, to: 3}, '3': {from: 8, to: 9}, '4': {from: 8, to: 10}},
        {'1': {from: 3, to: 4}, '2': {from: 3, to: 5}, '3': {from: 9, to: 11}, '4': {from: 10, to: 12}}
      ]);
    });

    it('should handle simpe three-way merge-unmerge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 2}, '3': {from: 1, to: 3}}
      ]);
    });

    it('should handle simpe three-way unmerge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
      ]);
    });

    it('should handle three-way unmerge-unmerge first', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 4}}
      ]);
    });

    it('should handle three-way unmerge-unmerge last', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 4}}
      ]);
    });

    it('should handle three-way unmerge-unmerge middle', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 4}, '3': {from: 1, to: 5}}
      ]);
    });

    it('should handle complex three-way unmerge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 4, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 4}, '3': {from: 1, to: 2}}
      ]);
    });

    it('should handle complex three-way unmerge-merge revers', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 4}, '3': {from: 1, to: 3}}
      ]);
    });

    it('should handle complex lang tree propagation simpe three-way merge-unmerge', () => {
      /*
       * 1 2
       *  3   4    5   6
       *  |>7        8
       *    |-->9
       *       10
       */
      let state;
      state = reducers({
          view: {
            texts: {
              syncData: {
                syncedTexts: {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10}
              }
            }
          },
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '4': {id: 4, sourceMerges: []},
              '5': {id: 5, sourceMerges: []},
              '6': {id: 6, sourceMerges: []},
              '7': {
                id: 7, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              },
              '8': {id: 8, sourceMerges: []},
              '9': {id: 9, sourceMerges: []},
              '10': {id: 10, sourceMerges: []},
            },
            config: {srcLang: {'1': 3, '2': 3, '3': 7, '4': 7, '5': 8, '6': 8, '7': 9, '8': 9, '9': 10, '10': null}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {
          '1': {from: 1, to: 3},
          '2': {from: 1, to: 3},
          '3': {from: 1, to: 3},
          '4': {from: 1, to: 2},
          '5': {from: 1, to: 3},
          '6': {from: 1, to: 3},
          '7': {from: 1, to: 2},
          '8': {from: 1, to: 3},
          '9': {from: 1, to: 3},
          '10': {from: 1, to: 3},
        }
      ]);
    });

    it('should handle complex lang tree propagation complex three-way unmerge-merge', () => {
      /*
       * 1 2
       *  3   4    5   6
       *  |>7        8
       *    |-->9
       *       10
       */
      let state;
      state = reducers({
          view: {
            texts: {
              syncData: {
                syncedTexts: {'1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10}
              }
            }
          },
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {id: 2, sourceMerges: []},
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              },
              '4': {id: 4, sourceMerges: []},
              '5': {id: 5, sourceMerges: []},
              '6': {id: 6, sourceMerges: []},
              '7': {
                id: 7, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4}
                ]
              },
              '8': {id: 8, sourceMerges: []},
              '9': {id: 9, sourceMerges: []},
              '10': {id: 10, sourceMerges: []},
            },
            config: {srcLang: {'1': 3, '2': 3, '3': 7, '4': 7, '5': 8, '6': 8, '7': 9, '8': 9, '9': 10, '10': null}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {
          '1': {from: 1, to: 3},
          '2': {from: 1, to: 3},
          '3': {from: 1, to: 3},
          '4': {from: 1, to: 4},
          '5': {from: 1, to: 2},
          '6': {from: 1, to: 2},
          '7': {from: 1, to: 4},
          '8': {from: 1, to: 2},
          '9': {from: 1, to: 2},
          '10': {from: 1, to: 2},
        }
      ]);
    });

    it('should handle four-way unmerge-merge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 4}, '3': {from: 1, to: 3}, '4': {from: 1, to: 2}}
      ]);
    });

    it('should handle two side fixed height four-way unmerge-merge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 1, srcTo: 4, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 5}, '3': {from: 1, to: 4}, '4': {from: 1, to: 2}}
      ]);
    });

    it('should handle different fixed height four-way unmerge-merge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 5}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 2, srcTo: 5, dstFrom: 2, dstTo: 3}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 1, srcTo: 4, dstFrom: 1, dstTo: 3}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 4}, '2': {from: 1, to: 6}, '3': {from: 1, to: 4}, '4': {from: 1, to: 3}}
      ]);
    });

    it('should handle different fixed height four-way unmerge-unmerge-merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 4}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 5}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 1, srcTo: 5, dstFrom: 1, dstTo: 3}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 3}, '2': {from: 1, to: 4}, '3': {from: 1, to: 6}, '4': {from: 1, to: 4}}
      ]);
    });

    it('should handle three-way two-level unmerge-unmerge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, en: 2, ru: 3}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
                  {srcFrom: 2, srcTo: 3, dstFrom: 3, dstTo: 5}
                ]
              }
            },
            config: {srcLang: {jp: null, en: 'jp', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 5}}
      ]);
    });

    it('should handle complex two-level four-way merge', () => {
      let state;
      state = reducers({
          view: {texts: {syncData: {syncedTexts: {jp: 1, cn: 2, en: 3, ru: 4}}}},
          data: {
            texts: {
              '1': {id: 1, sourceMerges: []},
              '2': {
                id: 2, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
                  {srcFrom: 2, srcTo: 4, dstFrom: 3, dstTo: 4}
                ]
              },
              '3': {
                id: 3, sourceMerges: [
                  {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
                  {srcFrom: 2, srcTo: 3, dstFrom: 3, dstTo: 5}
                ]
              },
              '4': {
                id: 4, sourceMerges: [
                  {srcFrom: 1, srcTo: 6, dstFrom: 1, dstTo: 2}
                ]
              }
            },
            config: {srcLang: {jp: null, cn: 'jp', en: 'cn', ru: 'en'}}
          }
        },
        {type: '@@ite/TEXTS_VIEW/RECALC_LINE_MERGES'}
      );
      expect(state.view.texts.syncData.lineMerges).toEqual([
        {'1': {from: 1, to: 4}, '2': {from: 1, to: 4}, '3': {from: 1, to: 6}, '4': {from: 1, to: 2}}
      ]);
    });

  });
});
