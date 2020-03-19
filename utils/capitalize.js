/* eslint-disable */
// function to capitalize the first letter of a string
module.exports = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
