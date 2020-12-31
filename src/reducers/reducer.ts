import { SAVED_JSON_CONFIG } from '../localStorageKeys'

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        title: action.payload,
      };
    case 'SET_CRED':
      return {
        ...state,
        credential: action.payload,
      };
    case 'ADDTO_SAVED_JSON_CONFIG':
      console.log("IN ADDTOSTATEEEEEEEEEEEEEEEEEEEEEEEEEEE");
      const newSavedJsonConfig = _addToLocalStorage(state, action);
      return {
        ...state,
        savedJsonConfigs: newSavedJsonConfig,
      };
    default:
      return state;
  }
}

/**
 * Add To SavedJsonConfig in local storage
 */
function _addToLocalStorage(state, action) {
  const copiedArray: any[] = state?.savedJsonConfigs?.length > 0 ? state.savedJsonConfigs.slice() : [];
  const obj = {};
  obj[action.payload.id] = action.payload.value;
  copiedArray.push(obj);

  localStorage.setItem(SAVED_JSON_CONFIG, JSON.stringify(copiedArray));

  return copiedArray;
}

export default reducer
