var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");

let encryptMessage = SHA256("Message").toString();
console.log(encryptMessage);
