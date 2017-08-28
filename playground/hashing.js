const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10
};

//sign creates the salted hash- takes in the object and the 'somesecretstring'
var token = jwt.sign(data, '123abc');
console.log(token);

//takes the token and makes sure the data wasn't manipulated
//returns an error if the token is incorrect
var decoded = jwt.verify(token, '123abc');
console.log('decoded', decoded);

//the following is what is accomplished within the jsonwebtoken library

// //let's hash something!
// var message = "I am the ultimate user";
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data= {
//   id: 4
// };
//
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecretstring').toString()
// }
//
// //hash the token data
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecretstring').toString();
//
// // // this could be a troublemaker trying to change the value of the data- this is what salting helps fight against
// // token.data.id=5;
// // token.hash= SHA256(JSON.stringify(token.data)).toString();
//
// //check if the hashed token data is the same as the 'hash' section of token
// //they should be the same
// if (resultHash === token.hash) {
//   console.log("data was not changed");
// }
// else {
//   console.log('data was changed. DO NOT TRUST')
// }
// //salting the hash, adds something on to the hash to make it unique everytime
// //the salt added here was 'somesecretstring'
