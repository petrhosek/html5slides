(function(window) {

var ORIGIN_ = location.protocol + '//' + location.host;

function SlideRemoteController() {
  this.popup = this.socket = null,
  this.isPopup = false;
  
  if (this.setupDone()) {
    this.socket.on('event', this.onMessage_.bind(this));

    // Close popups if we reload the main window.
    window.addEventListener('beforeunload', function(e) {
      /*if (this.socket) {
        this.socket.close();
      }*/
    }.bind(this), false);
  }
}

SlideRemoteController.PRESENTER_MODE_PARAM = 'presentme';
SlideRemoteController.CONTROLLER_MODE_PARAM = 'controlme';
SlideRemoteController.KEY_PARAM = 'key';

SlideRemoteController.prototype.setupDone = function() {
  var params = location.search.substring(1).split('&').map(function(el) {
    return el.split('=');
  });

  var presentMe = null;
  var controlMe = null;
  for (var i = 0, param; param = params[i]; ++i) {
    if (param[0].toLowerCase() == SlideRemoteController.PRESENTER_MODE_PARAM) {
      presentMe = param[1] == 'true';
      break;
    }
    if (param[0].toLowerCase() == SlideRemoteController.CONTROLLER_MODE_PARAM) {
      controlMe = param[1] == 'true';
      break;
    }
  }

  /*if (presentMe !== null) {
    localStorage.ENABLE_PRESENTOR_MODE = presentMe;
    // TODO: use window.history.pushState to update URL instead of the redirect.
    if (window.history.replaceState) {
      window.history.replaceState({}, '', location.pathname);
    } else {
      location.replace(location.pathname);
      return false;
    }
  }*/

  /*var enablePresenterMode = localStorage.getItem('ENABLE_PRESENTOR_MODE');
  if (enablePresenterMode && JSON.parse(enablePresenterMode)) {*/
  if (presentMe || controlMe) {
    if (controlMe) {
      this.isPopup = true;
    }
    // Only open popup from main deck. Don't want recursive popup opening!
    //if (!this.isPopup) {
      //var opts = 'menubar=no,location=yes,resizable=yes,scrollbars=no,status=no';
      //this.popup = window.open(location.href, 'mywindow', opts);
      this.popup = this.socket = io.connect(ORIGIN_);
      
      // Trigger the hotkey for turning presenter mode on.
      this.socket.on('connect', function() {
        var evt = document.createEvent('Event');
        evt.initEvent('keydown', true, true);
        evt.keyCode = 'P'.charCodeAt(0);
        document.dispatchEvent(evt);
        // this.popup.document.body.classList.add('with-notes');
        // document.body.classList.add('popup');
      }.bind(this));

      // Loading in the popup? Trigger the hotkey for turning presenter mode on.
      //this.popup.addEventListener('load', function(e) {
      //  var evt = this.popup.document.createEvent('Event');
      //  evt.initEvent('keydown', true, true);
      //  evt.keyCode = 'P'.charCodeAt(0);
      //  this.popup.document.dispatchEvent(evt);
        // this.popup.document.body.classList.add('with-notes');
        // document.body.classList.add('popup');
      //}.bind(this), false);
    //}
  }

  return true;
}

SlideRemoteController.prototype.onMessage_ = function(data) {
  // Restrict messages to being from this origin. Allow local developmet
  // from file:// though.
  // TODO: It would be dope if FF implemented location.origin!
  /*if (e.origin != ORIGIN_ && ORIGIN_.indexOf('file://') != 0) {
    alert('Someone tried to postMessage from an unknown origin');
    return;
  }*/

  // if (e.source.location.hostname != 'localhost') {
  //   alert('Someone tried to postMessage from an unknown origin');
  //   return;
  // }

  if ('keyCode' in data) {
    var evt = document.createEvent('Event');
    evt.initEvent('keydown', true, true);
    evt.keyCode = data.keyCode;
    document.dispatchEvent(evt);
  }
  
  if ('type' in data && 'direction' in data) {
    var evt = document.createEvent('Event');
    evt.initEvent('tap', true, true);
    evt.type = data.type;
    document.dispatchEvent(evt);
  }
  
  if ('type' in data) {
    var evt = document.createEvent('Event');
    evt.initEvent('tap', true, true);
    evt.type = data.type;
    document.dispatchEvent(evt);
  }
};

SlideRemoteController.prototype.sendMsg = function(msg) {
  // // Send message to popup window.
  // if (this.popup) {
  //   this.popup.postMessage(msg, ORIGIN_);
  // }

  // Send message to main window.
  if (this.isPopup) {
    this.socket.emit('event', msg);
  }
};

window.SlideRemoteController = SlideRemoteController;

})(window);
