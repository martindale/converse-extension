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
    self.ws = new WebSocket('wss://converse.ericmartindale.com/notifications');
    self.ws.onmessage = function(msg) {
      console.log('message!', msg);
      try {
        var message = JSON.parse(msg.data);
        if (!message.method) return;
        if (!message.params) return;
        if (message.method === 'patch') {
          if (message.params.channel === '/notifications') {
            self._setUnreadCount(++self.unreadCount);
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
    kango.browser.tabs.create({url: 'https://converse.ericmartindale.com/'});
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
