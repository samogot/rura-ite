import expect from 'expect';
import {mergeAtLine} from '../../../src/reducers/view/textsViewReducer';

describe('textsViewReducer.js', () => {

  context('mergeAtLine', () => {

    it('should handle no merges', () => {
      const syncData = {syncedTextsList: [1, 2, 3], lineMerges: []};
      const [merge, continueFrom] = mergeAtLine(1, 0, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 0, to: 1}, '2': {from: 0, to: 1}, '3': {from: 0, to: 1}}
      );
      expect(continueFrom).toEqual(0);
    });

    it('should handle exact merge', () => {
      const syncData = {
        syncedTextsList: [1, 2, 3],
        lineMerges: [
          {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
        ]
      };
      const [merge, continueFrom] = mergeAtLine(1, 1, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
      );
      expect(continueFrom).toEqual(0);
    });

    it('should handle after last merge', () => {
      const syncData = {
        syncedTextsList: [1, 2, 3],
        lineMerges: [
          {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
        ]
      };
      const [merge, continueFrom] = mergeAtLine(1, 2, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 2, to: 3}, '2': {from: 3, to: 4}, '3': {from: 2, to: 3}}
      );
      expect(continueFrom).toEqual(0);
    });

    it('should handle before first merge', () => {
      const syncData = {
        syncedTextsList: [1, 2, 3],
        lineMerges: [
          {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}}
        ]
      };
      const [merge, continueFrom] = mergeAtLine(1, 0, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 0, to: 1}, '2': {from: 0, to: 1}, '3': {from: 0, to: 1}}
      );
      expect(continueFrom).toEqual(0);
    });

    it('should handle after between merges', () => {
      const syncData = {
        syncedTextsList: [1, 2, 3],
        lineMerges: [
          {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}},
          {'1': {from: 5, to: 6}, '2': {from: 6, to: 7}, '3': {from: 5, to: 7}}
        ]
      };
      const [merge, continueFrom] = mergeAtLine(1, 2, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 2, to: 3}, '2': {from: 3, to: 4}, '3': {from: 2, to: 3}}
      );
      expect(continueFrom).toEqual(0);
    });

    it('should handle continueFrom', () => {
      const syncData = {
        syncedTextsList: [1, 2, 3],
        lineMerges: [
          {'1': {from: 1, to: 2}, '2': {from: 1, to: 3}, '3': {from: 1, to: 2}},
          {'1': {from: 5, to: 6}, '2': {from: 6, to: 7}, '3': {from: 5, to: 7}}
        ]
      };
      const [merge, continueFrom] = mergeAtLine(1, 6, syncData.lineMerges, syncData.syncedTextsList);
      expect(merge).toEqual(
        {'1': {from: 6, to: 7}, '2': {from: 7, to: 8}, '3': {from: 7, to: 8}}
      );
      expect(continueFrom).toEqual(1);
    });

  });

});
