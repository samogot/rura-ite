import expect from 'expect';
import reducers from '../../../app/reducers';


describe('textsDataReducer', () => {

  context('MERGE_NEXT_LINE', () => {

    it('should add first merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: []
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/MERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
      ]);
    });

    it('should add merge before first', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 0}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/MERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 0, srcTo: 1, dstFrom: 0, dstTo: 2},
        {srcFrom: 2, srcTo: 3, dstFrom: 3, dstTo: 5},
      ]);
    });

    it('should add merge after last', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 5}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/MERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
        {srcFrom: 4, srcTo: 5, dstFrom: 5, dstTo: 7},
      ]);
    });

    it('should add merge in middle', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 5}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
                {srcFrom: 9, srcTo: 11, dstFrom: 10, dstTo: 11},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/MERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
        {srcFrom: 4, srcTo: 5, dstFrom: 5, dstTo: 7},
        {srcFrom: 9, srcTo: 11, dstFrom: 11, dstTo: 12},
      ]);
    });

    it('should append to existing merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 2}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 4},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/MERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 3, dstFrom: 2, dstTo: 5},
      ]);
    });

  });

  context('UNMERGE_NEXT_LINE', () => {

    it('should do nothing on empty merges', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 0}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: []
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([]);
    });

    it('should reduce first merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 3}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
      ]);
    });

    it('should delete first merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([]);
    });

    it('should do nothing on unreducible merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
      ]);
    });

    it('should reduce undeletable merge', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 3}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
      ]);
    });

    it('should reduce merge before merges', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 3}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 4},
                {srcFrom: 5, srcTo: 6, dstFrom: 7, dstTo: 9},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
        {srcFrom: 5, srcTo: 6, dstFrom: 6, dstTo: 8},
      ]);
    });

    it('should delete merge before merges', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3},
                {srcFrom: 5, srcTo: 6, dstFrom: 7, dstTo: 9},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNMERGE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 5, srcTo: 6, dstFrom: 6, dstTo: 8},
      ]);
    });

  });

  context('DISUNITE_NEXT_LINE', () => {

    it('should add first disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: []
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/DISUNITE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
      ]);
    });

    it('should add disunite before first', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 0}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/DISUNITE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 0, srcTo: 2, dstFrom: 0, dstTo: 1},
        {srcFrom: 3, srcTo: 5, dstFrom: 2, dstTo: 3},
      ]);
    });

    it('should add disunite after last', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 4}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/DISUNITE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
        {srcFrom: 5, srcTo: 7, dstFrom: 4, dstTo: 5},
      ]);
    });

    it('should add disunite in middle', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 4}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
                {srcFrom: 10, srcTo: 11, dstFrom: 9, dstTo: 11},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/DISUNITE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
        {srcFrom: 5, srcTo: 7, dstFrom: 4, dstTo: 5},
        {srcFrom: 11, srcTo: 12, dstFrom: 9, dstTo: 11},
      ]);
    });

    it('should append to existing disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 2}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 2, srcTo: 4, dstFrom: 2, dstTo: 3},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/DISUNITE_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 2, srcTo: 5, dstFrom: 2, dstTo: 3},
      ]);
    });

  });

  context('UNIT_NEXT_LINE', () => {

    it('should do nothing on empty disunites', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 0}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: []
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([]);
    });

    it('should reduce first disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 4, dstFrom: 1, dstTo: 2}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
      ]);
    });

    it('should delete first disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([]);
    });

    it('should do nothing on unreducible disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
      ]);
    });

    it('should reduce undeletable disunite', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 3}
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 2, dstFrom: 1, dstTo: 3}
      ]);
    });

    it('should reduce merge before disunites', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 4, dstFrom: 1, dstTo: 2},
                {srcFrom: 7, srcTo: 9, dstFrom: 5, dstTo: 6},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2},
        {srcFrom: 6, srcTo: 8, dstFrom: 5, dstTo: 6},
      ]);
    });

    it('should delete merge before disunites', () => {
      let state;
      state = reducers({
        view: {
          texts: {
            '1': {
              selection: {ranges: [{line: 1}]}
            },
            focusedText: 1
          }
        },
        data: {
          texts: {
            '1': {
              id: 1,
              sourceMerges: [
                {srcFrom: 1, srcTo: 3, dstFrom: 1, dstTo: 2},
                {srcFrom: 7, srcTo: 9, dstFrom: 5, dstTo: 6},
              ]
            },
          }
        }
      }, {type: '@@ite/TEXTS_DATA/UNIT_NEXT_LINE'});
      expect(state.data.texts[1].sourceMerges).toEqual([
        {srcFrom: 6, srcTo: 8, dstFrom: 5, dstTo: 6},
      ]);
    });

  });
});
