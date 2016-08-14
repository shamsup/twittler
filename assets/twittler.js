(function(){
  window.streams.seen = [];
  window.streams.unseen = [];
  window.streams.yourself = [];
  window.visitor = 'shamsup';
  streams.users[visitor] = [];
})();
$(document).ready(function(){
  var $page = $('#view'); // logical controller of which feed we are viewing
  var $twittleArea = $('#twittle-stream'); // the area to append twittles
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
  var updateTwittleCounts = function(){
    // which feed are we looking at
    var view = $page.data('view');

    // get the unseen counts for each user and a total (home)
    // {home: 15, mracus: 3, shawndrost: 7, sharksforcheap: 4, douglascalhoun: 1}
    var userCounts = _.reduce(streams.unseen, function(counts, twittle){
      if (counts[twittle.user] !== undefined){
        counts[twittle.user] += 1;
      } else {
        counts[twittle.user] = 1;
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
          +'<span class="text"> new twittle' + ((userCounts[view] > 1) ? 's' : '') + '!</span>'
          +'</div>');
        $('#new-twittles').append($viewUnseenButton);
        $viewUnseenButton.slideDown(200);
      }
      var $count = $('.count', $viewUnseenButton);
      if ($count.text() != userCounts[view]) {
        if ($count.text() === '1'){
          $('.text', $viewUnseenButton).text(' new twittles!');
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

  var renderTwittles = function(twittles){
    _.each(twittles, function(twittle){
      var $newTwittle = $('<li class="twittle" />');
      var $header = $(
        '<h2 class="twittle-user">'
        + '<a href="#' + twittle.user +'">@' + twittle.user + '</a>'
        + '</h2>'
      );
      var $message = $('<div class="message">' + twittle.message + '</div>');
      var $timestamp = $(
        '<time class="timestamp" data-o-component="o-date" datetime="'
         + twittle.created_at.toISOString() + '">'
         + ODate.format(twittle.created_at,'datetime')
         + '</time>');
      $newTwittle.append($header, $message, $timestamp);
      $twittleArea.prepend($newTwittle);
      ODate.init($newTwittle[0]);
    });

    $('.twittle', $twittleArea).slideDown(200);
  };
  var getNewTwittles = function(){
    var latest = streams.home.slice(lastUpdatedIndex+1);
    lastUpdatedIndex = streams.home.length-1;

    _.each(latest, function(twittle){
      streams.unseen.push(twittle);
    });

    updateTwittleCounts();
  };

  var renderNewTwittles = function(){
    var filter = $page.data('view');

    var twittles = _.filterIntoNew(streams.unseen, function(twittle){
      return (filter === 'home' || filter === twittle.user);
    });

    _.each(twittles, function(twittle) {
      streams.seen.push(twittle);
    });

    updateTwittleCounts();
    renderTwittles(twittles);
  };

  var changeView = function() {
    $twittleArea.empty();
    var view = $page.data('view');
    var seen, unseen;

    var filterTwittlesByView = function(twittle) {
      return twittle.user === view;
    };

    if (view === 'home') {
      seen = streams.home;
      unseen = [];
      streams.unseen = [];
    } else {
      seen = _.filter(streams.seen, filterTwittlesByView);
      // additionally removes those twittles from the `streams.unseen` array
      // since we'll be viewing them.
      unseen = _.filterIntoNew(streams.unseen, filterTwittlesByView);
    }

    $('#feed-title').text(
      (view === 'home') ? 'Your Feed' :
      (view === visitor) ? 'Your twittles' :
      'Twittles by @' + view
    )

    updateTwittleCounts();
    renderTwittles(seen);
    renderTwittles(unseen);
    _.each(unseen, function(twittle){
      streams.seen.push(twittle);
    });
  };

  $body.on('click', 'a[href^="#"]', function(e){
    $page.data('view',$(this).attr('href').replace('#',''));
    changeView();
  });

  $body.on('click', '#unseen-count', renderNewTwittles);

  $('#write-twittle').submit(function(e){
    e.preventDefault();
    var message = $('#message').val();

    if (message) {
      writeTwittle(message);
      $('#message').val('');
      getNewTwittles();
      renderNewTwittles();
    }
  });

  (function(){
    var hash = document.location.hash.replace('#','');
    if (!hash.length || !_.contains(window.users, hash)){
      hash = 'home';
    }
    $page.data('view', hash);
  })();

  getNewTwittles();
  renderNewTwittles();


  setInterval(getNewTwittles, 5000);

  // fire ODate formatting
  document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
  //setInterval(renderNewTwittles, 5000);
  //streams.updateTimer = setInterval(renderNewTwittles, 10000);
});
