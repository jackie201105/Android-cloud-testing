/**
* File name: getInitials.js
* Author: HongMing
* Function: transform a string value into a new one beginning with two upper-case letters
*/

export default (name = '') => name.replace(/\s+/, ' ')
  .split(' ')
  .slice(0, 2)
  .map((v) => v && v[0].toUpperCase())
  .join('');
