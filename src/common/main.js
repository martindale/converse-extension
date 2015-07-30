var MAX_NOTIF_LENGTH = 140;﻿
var BASE_URL = 'converse.ericmartindale.com';

function Converse() {
  var self = this;
  self.unreadCount = 0;

  self._connect();

  kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
    self._onCommand();
  });
}

Converse.prototype = {
  _connect: function() {
    var self = this;
    self.ws = new WebSocket('ws://' + BASE_URL + '/notifications');
    self.ws.onmessage = function(msg) {
      console.log('message!', msg);
      try {
        var message = JSON.parse(msg.data);
        if (!message.method) return;
        if (!message.params) return;
        if (!message.params.ops || !message.params.ops.length) return;
        if (message.method === 'patch') {
          if (message.params.ops[0].op === 'add') {
            if (message.params.channel === '/posts') {
              self._setUnreadCount(++self.unreadCount);
              var id = message.params.ops[0].value._id;
              var content = message.params.ops[0].value.name;
              content += ' ' + message.params.ops[0].value.description;
              content = (content.length > MAX_NOTIF_LENGTH) ? content.substring(0, 139) + '…' : content;
              kango.ui.notifications.show('New Post', content, '/icons/icon48.png', function() {
                kango.browser.tabs.create({url: 'https://' + BASE_URL + '/posts/' + id });
              });
            }
            if (message.params.channel === '/comments') {
              self._setUnreadCount(++self.unreadCount);
              var id = message.params.ops[0].value._id;
              var content = message.params.ops[0].value.content;
              content = (content.length > MAX_NOTIF_LENGTH) ? content.substring(0, 139) + '…' : content;
              kango.ui.notifications.show('New Comment',  content, '/icons/icon48.png', function() {
                kango.browser.tabs.create({url: 'https://' + BASE_URL + '/comments/' + id });
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    self.ws.onerror = function() {
      self._connect();
    };
  },
  _onCommand: function() {
    kango.browser.tabs.create({url: 'https://' + BASE_URL + '/'});
  },
  _setUnreadCount: function(count) {
    var self = this;
    self.unreadCount = count;
    kango.ui.browserButton.setTooltipText('Unread count: ' + count);
    kango.ui.browserButton.setIcon('icons/button.png');
    kango.ui.browserButton.setBadgeValue(count);
  }
};

var extension = new Converse();
