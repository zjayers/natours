/* eslint-disable */
import axios from 'axios';
import * as alert from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: { name, email, password, passwordConfirm }
    });

    if (res.data.status === 'success') {
      alert.showAlert('success', 'Signed Up Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (error) {
    alert.showAlert('error', error.response.data.message);
  }
};
