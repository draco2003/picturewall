var socket = io();

$(document).on('click','.action-btn', function(event) { 
    console.log('Button CLicked');
    socket.emit('remote-action', { 
      client: this.dataset.id,
      action: this.dataset.action
    })
    console.log(this.dataset.id);
    console.log(this.dataset.action);
})

var vm = new Vue({
  el: '#app',
  data: {
    screens: {},
    pages: {},
    referrers: {},
		activeUsers: 0
  },
  created: function() {
    socket.on('updated-screens', function(data) {
      screens = [];
      screenCount = 1;
      for (screen in data.screens) {
        data.screens[screen].htmlId = 'id' + screenCount;
        screenCount++;
      }
			this.screens = data.screens;
			this.referrers = data.referrers;
			this.activeUsers = data.activeUsers;
    }.bind(this));
  }
});
