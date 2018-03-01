/* global define */
define([
  'jquery'
, 'ramda'
, 'pointfree'
, 'Maybe'
, 'player'
, 'io'
, 'bacon'
, 'http'
], function($, _, P, Maybe, Player, io, Beacon, http) {
  'use strict';
  io.extendFn();

  // HELPERS ///////////////////////////////////////////
  var compose = P.compose;
  var map = P.map;
  var log = function(x) { console.log(x); return x; }
  var fork = _.curry(function(err, succ, future) { return future.fork(err, succ); });
  var setHtml = _.curry(function(sel, x) { return $(sel).html(x); });

  // PURE //////////////////////////////////////////////////
  
  var listen = _.curry(function(type,elt){
    return Beacon.fromEventTarget(elt,type);
  });

  // getDom :: String -> IO Dom
  var getDom = $.toIO();

  //- Api Key
  var api_key = 'AIzaSyAWoa7aqds2Cx_drrrb5FPsRObFa7Dxkfg';

  // keyPressStram :: Dom -> EventStream DomEvent
  var keyPressStream = listen('keyup');
  
  //- eventValue :: DomEvent -> String
  var eventValue = compose(_.get('value'),_.get('target'));

  // valueStream :: Dom -> EventStream String
  var valueStream = compose(map(eventValue),keyPressStream);

  //- termUrl :: String -> URL
  var termUrl = function(term){
    return 'https://www.googleapis.com/youtube/v3/search?' +
      $.param({part: 'snippet', q: term, key: api_key});
  };

  // urlStream :: Dom -> EventStream URL
  var urlStream = compose(map(termUrl),valueStream);

  // search :: String -> Future JSON
  var searchStream = compose(map(http.getJSON),urlStream);

  // IMPURE /////////////////////////////////////////////////////
  getDom("#search").map(searchStream).runIO().onValue(fork(log,log));

});
