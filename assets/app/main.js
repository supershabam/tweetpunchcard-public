'use strict';

var PunchcardView = require('./views/punchcard')
  , ControlsView = require('./views/controls')
  , punchcardService = require('./service/punchcard')
  , punchcardHelper = require('./lib/punchcard')
  , punchcardView
  , controlsView
  , requestId = 0
  , app
  ;

app = _.extend({}, Backbone.Events);
punchcardView = new PunchcardView({
  el: $('#punchcard-holder')
});
controlsView = new ControlsView({
  app: app,
  el: $('#controls')
});

app.on('view', function(twitterHandle) {
  app.trigger('loading', true);
  punchcardView.clear();
  requestId++;
  (function(myRequestId) {
    punchcardService.getPunchcard(twitterHandle, function(err, punchcard) {
      if (err) console.log(err);

      // only affect app if our request is the current request
      if (requestId === myRequestId) {
        app.trigger('loading', false);
        if (err) return;
        punchcardHelper.translateToTimezone(punchcard, moment().zone());
        punchcardView.render(punchcard);
      }
    });
  })(requestId);  
});
