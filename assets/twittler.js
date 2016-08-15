(function(){
  window.streams.seen = [];
  window.streams.unseen = [];
  window.streams.yourself = [];
  window.visitor = 'shamsup'; // thisis you.
  streams.users[visitor] = [];
})();
$(document).ready(function(){
  // cache the jQuery objects so that we don't have to search for the same nodes repeatedly
  var $page = $('#view'); // logical controller of which feed we are viewing
  var $twittleArea = $('#twittle-stream'); // the area to append twittles
  var $body = $('body'); // the body to handle delegated events
  var lastUpdatedIndex = -1; // initialize our tracker for which twittles we've collected
  var $users = $('#users'); // the user nav list

  // add "yourself" to the user nav list
  $users.append($(
    '<li id="user-' + visitor + '">'
    + '<a href="#' + visitor + '">yours (@' + visitor +')</a>'
    + '</li>'
  ));

  // add all the other users to the user nav list
  _.each(users, function(username){
    $users.append($(
      '<li id="user-' + username + '">'
      + '<a href="#' + username + '">@' + username + '</a>'
      + '</li>'
    ));
  });

  // Updates the counts for the total unseen twittles and the unseen twittles for each user
  var updateTwittleCounts = function(){
    // which feed are we looking at
    // will either be 'home' or a username ie 'shawndrost'
    var view = $page.data('view');

    // get the unseen counts for each user and a total (home)
    // example output: {home: 15, mracus: 3, shawndrost: 7, sharksforcheap: 4, douglascalhoun: 1}
    var userCounts = _.reduce(streams.unseen, function(counts, twittle){
      if (counts[twittle.user] !== undefined){
        counts[twittle.user] += 1;
      } else {
        counts[twittle.user] = 1;
      }
      counts.home += 1;
      return counts;
    }, {home: 0});

    // if there are new twittles for the view we are on, then we update the new twittles button
    if (userCounts[view] > 0) {
      var $viewUnseenButton = $('#unseen-count');

      if ($viewUnseenButton.length === 0) {
        // create the button if it doesn't exist
        $viewUnseenButton = $(
          '<div id="unseen-count">'
          +'<span class="count"/>'
          +'<span class="text"> new twittle' + ((userCounts[view] > 1) ? 's' : '') + '!</span>'
          +'</div>');
        // then add it to the dom
        $('#new-twittles').append($viewUnseenButton);
        // and animate it down
        $viewUnseenButton.slideDown(200);
      }

      // otherwise we just want to update the count
      var $count = $('.count', $viewUnseenButton);
      // so we check to see if the count has changed since the last update
      // which sometimes it doesn't change if we are on a user-specific view
      if ($count.text() != userCounts[view]) {
        // and we check to see if it currently has 1 as the count
        if ($count.text() === '1'){
          // because we need to make the text plural so that we don't look foolish
          $('.text', $viewUnseenButton).text(' new twittles!');
        }
        // then we update the count and animate the text with a nice little flash
        // effect so that the user can see that it updated
        $count.text(userCounts[view])
          .css('opacity', 0)
          .animate({ opacity: 1}, 100);
      }
    } else {
      // and if we don't have any new twittles, we want to make sure the button
      //isn't showing, so we just remove it like a bawss
      $('#unseen-count').remove();
    }

    // now we need to update the counts for each user in the list
    _.each(users, function(user){
      var $user = $('#user-' + user, $users);
      var $count = $('.count', $user);
      // so if there are unseen twittles for the user
      if (userCounts[user]){
        // make sure that the count badge exists; if it doesn't then we add it,
        // otherwise we just update the text
        if ($count.length === 0) {
          $user.prepend($('<span class="count">' + userCounts[user] + '</span>'));
        } else {
          $count.text(userCounts[user]);
        }
      } else {
        // and if the user has no new twittles, we just remove the badge
        $count.remove();
      }
    });
  };

  // takes an array of twittle objects and transforms them into neat dom nodes
  // then adds them to the view. These twittles should be filtered for view
  // prior to calling this
  var renderTwittles = function(twittles){
    // we gotta loop through them, of course
    _.each(twittles, function(twittle){
      // create an <li> element to hold our twittle
      var $newTwittle = $('<li class="twittle" />');
      // and we make a nice little header with a link to the user's page
      var $header = $(
        '<h2 class="twittle-user">'
        + '<a href="#' + twittle.user +'">@' + twittle.user + '</a>'
        + '</h2>'
      );
      // pretty self-explanitory div
      var $message = $('<div class="message">' + twittle.message + '</div>');
      // and we create a timestamp via ODate, which will automatically
      // update its format text whenever we fire a custom event for it
      var $timestamp = $(
        '<time class="timestamp" data-o-component="o-date" datetime="'
         + twittle.created_at.toISOString() + '">'
         + ODate.format(twittle.created_at,'datetime')
         + '</time>');
      // we add all of our cool new nodes into our <li>
      $newTwittle.append($header, $message, $timestamp);
      // and we add it to the top of the twittles list
      $twittleArea.prepend($newTwittle);
      // this sets up the eventlistener for updating the timestamp text
      ODate.init($newTwittle[0]);
    });
    // and since all of our new tweets start out invisible, we need to display
    // them with a subtle animation
    $('.twittle', $twittleArea).slideDown(200);
  };

  // this function will check the streams.home array for new twittles
  var getNewTwittles = function(){
    // get an array of only new ones, based on our last update
    var latest = streams.home.slice(lastUpdatedIndex+1);
    // and update our index so that we can fetch the correct ones next time
    lastUpdatedIndex = streams.home.length-1;

    // take these new twittles, and add them to our unseen array
    _.each(latest, function(twittle){
      streams.unseen.push(twittle);
    });
    // then we make sure that the count badges update with the new twittles
    updateTwittleCounts();
  };

  // this function will render only the new twittles that were fetched.
  // it's basically just a wrapper for our renderTwittles function to filter
  // for only new twittles.
  var renderNewTwittles = function(){
    // get the view that we are in
    // either 'home' or a username like 'shawndrost'
    var filter = $page.data('view');

    // we want to remove the twittles that we are going to view from the unseen array
    // so we filter them based on the user. if the view is home, we want all the twittles
    var twittles = _.filterIntoNew(streams.unseen, function(twittle){
      return (filter === 'home' || filter === twittle.user);
    });

    // and we add them to the seen array, because now we're going to see them
    _.each(twittles, function(twittle) {
      streams.seen.push(twittle);
    });
    // then we update the badges since we are going to view some now
    updateTwittleCounts();
    // and we render our filtered list of twittles
    renderTwittles(twittles);
  };

  // when a user clicks a link, we need to update the view so
  // that we know which twittles we should show
  var changeView = function() {
    // so we clear our twittle area -- bye-bye beautifully-rendered list.
    $twittleArea.empty();

    // get the new view
    var view = $page.data('view');
    // and initialize some empty variables
    var seen, unseen;

    // write a quick filter function to check the twittle user against the view
    // we are looking at
    var filterTwittlesByView = function(twittle) {
      return twittle.user === view;
    };

    // if the view is home, we just want all the twittles, so we don't need a filter
    if (view === 'home') {
      seen = streams.home;
      unseen = [];
      // and since we are viewing them all, we can empty the unseen array
      streams.unseen = [];
    } else {
      // otherwise we are viewing a user's feed, so we need to get only those twittles

      // the twittles we've already seen
      seen = _.filter(streams.seen, filterTwittlesByView);

      // and the twittles that we are just now going to see.
      // this also removes them from the unseen array since we're going to see them
      unseen = _.filterIntoNew(streams.unseen, filterTwittlesByView);
    }

    // update the heading text for the feed
    $('#feed-title').text(
      (view === 'home') ? 'Your Feed' :
      (view === visitor) ? 'Your twittles' :
      'Twittles by @' + view
    );

    // then we need to update the badges, since we're viewing new ones again
    updateTwittleCounts();
    // and show the previously seen twittles
    renderTwittles(seen);
    // then show the new ones
    renderTwittles(unseen);
    // and make sure that all of our new ones get added to our list of seen twittles
    _.each(unseen, function(twittle){
      streams.seen.push(twittle);
    });
  };

  // when a link is clicked, we need to update the view that we are on,
  // then render the new view
  $body.on('click', 'a[href^="#"]', function(e){
    $page.data('view',$(this).attr('href').replace('#',''));
    changeView();
  });

  // when a user clicks on the new twittles button, we render the new twittles
  $body.on('click', '#unseen-count', renderNewTwittles);

  // when the user submits the form, we need to add a twittle from them
  $('#write-twittle').submit(function(e){
    // make sure it doesn't actually submit
    e.preventDefault();
    // get the message they wrote in the box
    var message = $('#message').val();

    // we don't want any empty twittles, ya hear!?
    if (message) {
      // function provided by data_generator to add the twittle to the home array
      writeTwittle(message);
      // reset the contents of the text input
      $('#message').val('');

      // and force an update of the new twittles
      getNewTwittles();
      // then we show the new ones because we just assume that the user
      // wants to see all the new twittles when they post their own... for simplicity
      renderNewTwittles();
    }
  });

  // when we load the page, check the hash portion of the url to see if we
  // need to load a specific view initially
  (function(){
    var hash = document.location.hash.replace('#','');
    // if the hash doesn't match a user, we assume they meant home.
    if (!hash.length || !_.contains(window.users, hash)){
      hash = 'home';
    }
    // then we set the view to whatever they passed us (or home)
    $page.data('view', hash);
  })();

  // get the first batch and render them
  getNewTwittles();
  renderNewTwittles();

  // every 5 seconds we want to check for new twittles
  setInterval(getNewTwittles, 5000);

  // tell the ODate objects that the page has loaded
  document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
