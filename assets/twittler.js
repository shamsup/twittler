(function(){
  window.streams.seen = [];
  window.streams.unseen = [];
  window.streams.yourself = [];
  window.visitor = 'shamsup';
  streams.users[visitor] = [];
})();
$(document).ready(function(){
  var $page = $('#view'); // logical controller of which feed we are viewing
  var $tweetArea = $('#tweet-stream'); // the area to append tweets
  var $body = $('body'); // the body to handle delegated events
  var lastUpdatedIndex = -1; // start off with the first element of the `streams.home` array
  var $users = $('#users'); // the user list

  // add "yourself" to the list of users
  $users.append($(
    '<li id="user-' + visitor + '">'
    + '<a href="#' + visitor + '">yours (@' + visitor +')</a>'
    + '</li>'
  ));

  // add all the other users to the list of users
  _.each(users, function(username){
    $users.append($(
      '<li id="user-' + username + '">'
      + '<a href="#' + username + '">@' + username + '</a>'
      + '</li>'
    ));
  });

  // Updates the counts for total unseen and unseen for each user
  var updateTweetCounts = function(){
    // which feed are we looking at
    var view = $page.data('view');

    // get the unseen counts for each user and a total (home)
    // {home: 15, mracus: 3, shawndrost: 7, sharksforcheap: 4, douglascalhoun: 1}
    var userCounts = _.reduce(streams.unseen, function(counts, tweet){
      if (counts[tweet.user] !== undefined){
        counts[tweet.user] += 1;
      } else {
        counts[tweet.user] = 1;
      }
      counts.home += 1;
      return counts;
    }, {home: 0});

    // if there are
    if (userCounts[view] > 0) {
      var $viewUnseenButton = $('#unseen-count');

      if ($viewUnseenButton.length === 0) {
        $viewUnseenButton = $(
          '<div id="unseen-count">'
          +'<span class="count"/>'
          +'<span class="text"> new tweet' + ((userCounts[view] > 1) ? 's' : '') + '!</span>'
          +'</div>');
        $('#new-tweets').append($viewUnseenButton);
        $viewUnseenButton.slideDown(200);
      }
      var $count = $('.count', $viewUnseenButton);
      if ($count.text() != userCounts[view]) {
        if ($count.text() === '1'){
          $('.text', $viewUnseenButton).text(' new tweets!');
        }
        $count.text(userCounts[view])
          .css('opacity', 0)
          .animate({ opacity: 1}, 100);
      }
    } else {
      $('#unseen-count').remove();
    }

    _.each(users, function(user){
      var $user = $('#user-' + user, $users);
      var $count = $('.count', $user);
      if (userCounts[user]){
        if ($count.length === 0) {
          $user.prepend($('<span class="count">' + userCounts[user] + '</span>'));
        } else {
          $count.text(userCounts[user]);
        }
      } else {
        $count.remove();
      }
    });
  };

  var renderTweets = function(tweets){
    _.each(tweets, function(tweet){
      var $newTweet = $('<li class="tweet" />');
      var $header = $(
        '<h2 class="tweet-user">'
        + '<a href="#' + tweet.user +'">@' + tweet.user + '</a>'
        + '</h2>'
      );
      var $message = $('<div class="message">' + tweet.message + '</div>');
      var $timestamp = $(
        '<time class="timestamp" data-o-component="o-date" datetime="'
         + tweet.created_at.toISOString() + '">'
         + ODate.format(tweet.created_at,'datetime')
         + '</time>');
      $newTweet.append($header, $message, $timestamp);
      $tweetArea.prepend($newTweet);
      ODate.init($newTweet[0]);
      $newTweet.slideDown(200);
    });
  };
  var getNewTweets = function(){
    var latest = streams.home.slice(lastUpdatedIndex+1);
    lastUpdatedIndex = streams.home.length-1;

    _.each(latest, function(tweet){
      streams.unseen.push(tweet);
    });

    updateTweetCounts();
  };

  var renderNewTweets = function(){
    var filter = $page.data('view');

    var tweets = _.filterIntoNew(streams.unseen, function(tweet){
      return (filter === 'home' || filter === tweet.user);
    });

    _.each(tweets, function(tweet) {
      streams.seen.push(tweet);
    });

    updateTweetCounts();
    renderTweets(tweets);
  };

  var changeView = function() {
    $tweetArea.empty();
    var view = $page.data('view');
    var seen, unseen;

    var filterTweetsByView = function(tweet) {
      return tweet.user === view;
    };

    if (view === 'home') {
      seen = streams.home;
      unseen = [];
      streams.unseen = [];
    } else {
      seen = _.filter(streams.seen, filterTweetsByView);
      // additionally removes those tweets from the `streams.unseen` array
      // since we'll be viewing them.
      unseen = _.filterIntoNew(streams.unseen, filterTweetsByView);
    }

    $('#feed-title').text(
      (view === 'home') ? 'Your Feed' :
      (view === visitor) ? 'Your tweets' :
      'Tweets by @' + view
    )

    updateTweetCounts();
    renderTweets(seen);
    renderTweets(unseen);
    _.each(unseen, function(tweet){
      streams.seen.push(tweet);
    });
  };

  $body.on('click', 'a[href^="#"]', function(e){
    $page.data('view',$(this).attr('href').replace('#',''));
    changeView();
  });

  $body.on('click', '#unseen-count', renderNewTweets);

  $('#write-tweet').submit(function(e){
    e.preventDefault();
    var message = $('#message').val();

    if (message) {
      writeTweet(message);
      $('#message').val('');
      getNewTweets();
      renderNewTweets();
    }
  });

  (function(){
    var hash = document.location.hash.replace('#','');
    if (!hash.length || !_.contains(window.users, hash)){
      hash = 'home';
    }
    $page.data('view', hash);
  })();

  getNewTweets();
  renderNewTweets();


  setInterval(getNewTweets, 5000);

  // fire ODate formatting
  document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
  //setInterval(renderNewTweets, 5000);
  //streams.updateTimer = setInterval(renderNewTweets, 10000);
});
