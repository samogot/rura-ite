import debounce from 'lodash.debounce';
import VERSION from '../constants/VERSION';

function autoSave(state, dispatch) {
  window.localStorage.setItem(`ite-redux-store-${VERSION}`, JSON.stringify(state));
}

export default debounce(autoSave, 1000)