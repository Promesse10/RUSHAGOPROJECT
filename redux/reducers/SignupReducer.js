const signupReducer = (state = {}, action) => {
    switch (action.type) {
      case "LOADING":
        return {
          ...state,
          isLoading: action.payload,
        };
      case "SIGNUP_SUCCESS":
        return {
          ...state,
          isSignupSuccess: action.isSignupSuccess,
          isSignupFailed: action.isSignupFailed,
          isLoading: false
        };
      case "SIGNUP_FAILURE":
        return {
          ...state,
          isSignupFailed: action.isSignupFailed,
          isSignupSuccess: action.isSignupSuccess,
          isLoading: false
        };
      default:
        return state;
    }
  };
  export default signupReducer;