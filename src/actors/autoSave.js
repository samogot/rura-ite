import debounce from 'lodash.debounce';

function autoSave(state, dispatch) {
  window.localStorage.setItem("redux-store", JSON.stringify(state));
}

export default debounce(autoSave, 1000)