/* eslint-disable */
import axios from 'axios';
import * as alert from './alerts';

export const resetPassword = async (password, passwordConfirm) => {
  try {
    var token = window.location.hash.substring(1);
    const res = await axios({
      method: 'PATCH',
      url: `http://127.0.0.1:3000/api/v1/users/resetPassword/${token}`,
      data: { password, passwordConfirm }
    });

    if (res.data.status === 'success') {
      alert.showAlert('success', 'Password Reset Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    alert.showAlert('error', error.response.data.message);
  }
};
