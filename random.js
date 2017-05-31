var RandomHelper = {};
var crypto = require('crypto');

/**
 * Generate random value in base64 Format
 * @param  {Integer} len result characters length
 * @return {String}     result ex: wNm2OQu7UaTB
 * Code from: https://blog.tompawlak.org/generate-random-values-nodejs-javascript
 */
RandomHelper.randomValueBase64 = function (len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')   // convert to base64 format
    .slice(0, len)        // return required number of characters
    .replace(/\+/g, '0')  // replace '+' with '0'
    .replace(/\//g, '0'); // replace '/' with '0'
}

/**
 * Generate random value in hex format
 * @param  {Integer} len result characters length
 * @return {[type]}     result ex: d5be8583137b
 * Code from: https://blog.tompawlak.org/generate-random-values-nodejs-javascript
 */
RandomHelper.randomValueHex = function (len) {
  return crypto.randomBytes(Math.ceil(len/2))
    .toString('hex') // convert to hexadecimal format
    .slice(0,len);   // return required number of characters
}


module.exports = RandomHelper;
