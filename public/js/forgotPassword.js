/* eslint-disable */
import axios from 'axios';
import * as alert from './alerts';

export const forgotPassword = async email => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/forgotPassword',
      data: { email }
    });

    if (res.data.status === 'success') {
      alert.showAlert('success', res.data.message);
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (error) {
    alert.showAlert('error', error.response.data.message);
  }
};
