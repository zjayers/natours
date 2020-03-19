/* eslint-disable */
const capitalize = require('./../../utils/capitalize');
import axios from 'axios';
import * as alert from './alerts';

// Type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    console.log(data);
    console.log(type);
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      alert.showAlert('success', `${capitalize(type)} updated successfully!`);
    }
  } catch (err) {
    console.log(err);
    alert.showAlert('error', err.response.data.message);
  }
};
