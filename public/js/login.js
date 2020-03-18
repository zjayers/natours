/* eslint-disable */
import axios from 'axios';
import * as alert from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password }
    });

    if (res.data.status === 'success') {
      alert.showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    alert.showAlert('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    if ((res.data.status = 'success')) location.reload(true); //Force a server reload
  } catch (error) {
    console.log(error.response);
    alert.showAlert('error', 'Error logging out! Try again.');
  }
};
