/*
 * NOTE: This file generates fake twittle data, and is not intended to be part of your implementation.
 * You can safely leave this file untouched, and confine your changes to index.html.
 */

// set up data structures
window.streams = {};
streams.home = [];
streams.users = {};
streams.users.shawndrost = [];
streams.users.sharksforcheap = [];
streams.users.mracus = [];
streams.users.douglascalhoun = [];
window.users = Object.keys(streams.users);

// utility function for adding twittles to our data structures
var addTwittle = function(newTwittle){
  var username = newTwittle.user;
  streams.users[username].push(newTwittle);
  streams.home.push(newTwittle);
};

// utility function
var randomElement = function(array){
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// random twittle generator
var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'the president', 'that wizard', 'a ninja'];
var verbs = ['deployed', 'got', 'developed', 'built', 'invented', 'experienced', 'fought off', 'enjoyed', 'developed', 'consumed', 'debunked', 'made', 'wrote', 'saw'];
var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

var randomMessage = function(){
  return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns), randomElement(tags)].join(' ');
};

// generate random twittles on a random schedule
var generateRandomTwittle = function(){
  var twittle = {};
  twittle.user = randomElement(users);
  twittle.message = randomMessage();
  twittle.created_at = new Date();
  addTwittle(twittle);
};

for(var i = 0; i < 10; i++){
  generateRandomTwittle();
}

var scheduleNextTwittle = function(){
  generateRandomTwittle();
  setTimeout(scheduleNextTwittle, 1000 + Math.random() * 2000);
};
scheduleNextTwittle();

// utility function for letting students add "write a twittle" functionality
// (note: not used by the rest of this file.)
var writeTwittle = function(message){
  if(!visitor){
    throw new Error('set the global visitor property!');
  }
  var twittle = {};
  twittle.user = visitor;
  twittle.message = message;
  twittle.created_at = new Date();
  addTwittle(twittle);
};
