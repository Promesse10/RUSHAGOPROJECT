import axios from "axios";

export const signupAction = (data) => async (dispatch) => {
  dispatch({ type: 'LOADING', payload: true })
  const headers = {
    "Content-Type": "application/json",
  };
  
  
  await axios.post("http://192.168.1.65:15000/api/v1/auth/signup", 
    {name: data.fullName, password: data.password, phone: data.phone, email: data.email},
    headers
  )
    .then((response) => {
    if (response.status === 201) {
        console.log('==-=-=-=-=-==-=')
      dispatch({ type: "SIGNUP_SUCCESS", isSignupSuccess: true, isSignupFailed : false})
    } else {
        console.log('==-=-=-=-=-==-= Err4')

        
      dispatch({ type: "SIGNUP_FAILURE", isSignupSuccess: false, isSignupFailed: true })
    }
  }).catch((err) => {
    console.log('==-=-=-=-=-==-= Err', err)

    dispatch({ type: "SIGNUP_FAILURE", isSignupFailed: true, isSignupSuccess: false })

  })
}