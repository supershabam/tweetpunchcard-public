'use strict';

var KEY_ENTER = 13;

module.exports = Backbone.View.extend({
  initialize: function(options) {
    this._app = options.app;
    this._$button = this.$el.find('.button-handle');
    this._$input = this.$el.find('.input-handle');

    this._app.on('loading', this.onLoading, this);
  },
  onLoading: function(flag) {
    if (flag) {
      this.disable();
    } else {
      this.enable();
    }
  },
  events: {
    'click .button-handle': 'onclick',
    'keyup .input-handle': 'keyup'
  },
  onclick: function(e) {
    this.submit();
  },
  keyup: function(e) {
    var key = e.which || e.key;

    if (key === KEY_ENTER) return this.submit();
  },
  submit: function() {
    var twitterHandle = this.$el.find('.input-handle').val();
    mixpanel.track('submit', {
      handle: twitterHandle
    });
    this._app.trigger('view', twitterHandle);
  },
  disable: function() {
    this.$el.find('*').attr('disabled', 'disabled');
  },
  enable: function() {
    this.$el.find('*').removeAttr('disabled');
  }
});
