function reducer(state, action) {
  switch (action.type) {
    case "SET_TITLE":
      return {
        ...state,
        title: action.payload
      };
    case "SET_CRED":
      return {
        ...state, 
        credential: action.payload
      }
    default:
      return state;
  }
}

export default reducer;
