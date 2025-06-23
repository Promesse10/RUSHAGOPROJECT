import axios from 'axios';

const API_BASE_URL = 'localhost:15000/api/v1/auth'; // Replace with your machine's IP address

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000, // Increase timeout to 20 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced POST request with better error handling
export const postData = async (endpoint, data, config = {}) => {
  console.log('=-=-=-=-=-=-=-=-=>>>>>', endpoint, data, config)
  try {
    const response = await api.post(endpoint, data, config);
    console.log('=-=-=-=-=-=-=-=-=>>>>>', response)
    
    // Successful response (2xx)
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers
    };
    
  } catch (error) {
    console.log('=-=-=-=-=-=-=-=-=>>>>> Error 1', error)

    // // Handle different error scenarios
    // let errorMessage = 'An unexpected error occurred';
    // let statusCode = null;
    // let errorData = null;

    // if (error.response) {
    //   // The request was made and the server responded with a status code
    //   // that falls out of the range of 2xx
    //   statusCode = error.response.status;
    //   errorData = error.response.data;
      
    //   errorMessage = errorData.message || 
    //                 errorData.error || 
    //                 `Request failed with status code ${statusCode}`;
      
    // } else if (error.request) {
    //   // The request was made but no response was received
    //   errorMessage = 'No response received from server. Please check your network connection.';
    // } else {
    //   // Something happened in setting up the request that triggered an Error
    //   errorMessage = error.message;
    // }
    // console.log('=-=-=-=-=-=-=-=-=>>>>> Error 2', errorMessage)

    // console.error(`API Error [${endpoint}]:`, {
    //   message: errorMessage,
    //   status: statusCode,
    //   data: errorData,
    //   config: error.config
    // });

  //   // Throw a standardized error object
  //   throw {
  //     message: errorMessage,
  //     status: statusCode,
  //     data: errorData,
  //     isApiError: true
  //   };
  }
};

// Specific auth API methods
export const authApi = {
  signup: async (userData) => {
    return await postData('/signup', userData);
  },
  
  verifyEmail: async (token) => {
    return await postData('/verify-email', { token });
  },
  
  verifyPhone: async (phone, code) => {
    return await postData('/verify-phone', { phone, code });
  },
  
  login: async (email, password) => {
    return await postData('/login', { email, password });
  },
  
  forgotPassword: async (email) => {
    return await postData('/forgot-password', { email });
  },
  
  resetPassword: async (token, newPassword) => {
    return await postData('/reset-password', { token, newPassword });
  }
};

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global error responses here
    return Promise.reject(error);
  }
);

