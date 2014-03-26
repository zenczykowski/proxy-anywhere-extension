/**
 * Controls the state of the current proxy being used by Chrome.
 *
 * @constructor
 */
ProxyController = function()
{
  // Global status that states if the custom proxy is set.
  this.proxyStatus = false;

  // Listen on Browser Action clicks.
  chrome.browserAction.onClicked.addListener(this.onBrowserActionClicked.bind(this));

  // Listen on Proxy Errors.
  chrome.proxy.onProxyError.addListener(this.onProxyError.bind(this));
};

ProxyController.ONLINE_ICON = '/img/online.png';
ProxyController.OFFLINE_ICON = '/img/offline.png';
ProxyController.ERROR_ICON = '/img/error.png';

/**
 * To knwo the status when the custom proxy server is active or online.
 *
 * @returns {boolean} true is custom proxy is set and active.
 */
ProxyController.prototype.isProxyActive = function()
{
  return this.proxyStatus;
};

/**
 * Browser action button on the Chrome toolbar that has been clicked.
 * Toggle behaviour.
 *
 * @parm {Object<Tab>} tab Gives the state of the tab that was clicked on.
 */
ProxyController.prototype.onBrowserActionClicked = function(tab)
{
  if (this.tm) {
    clearTimeout(this.tm);
    this.tm = null;
  };
  this.setProxyEnabled(!this.proxyStatus);
};

/**
 * Notifies about proxy errors.
 *
 * @parm {Object} details Gives the state of the error.
 */
ProxyController.prototype.onProxyError = function(details)
{
  if (this.tm) {
    clearTimeout(this.tm);
    this.tm = null;
  };

  chrome.browserAction.setIcon({ path: ProxyController.ERROR_ICON });
  chrome.browserAction.setTitle({title: details.error});

  var _this = this;
  this.tm = setTimeout(function(){
    chrome.browserAction.setIcon({ path: _this.proxyStatus ? ProxyController.ONLINE_ICON : ProxyController.OFFLINE_ICON });
    chrome.browserAction.setTitle({ title: _this.proxyStatus ? 'Online' : 'Offline' });
  },9000);
};

/**
 * Initialize the proxy.
 */
ProxyController.prototype.init = function()
{
  // Synchronously retrieve the current extension version.
  var version = 'NaN';
  var manifest = chrome.runtime.getManifest();
  var currVersion = manifest.version;
  var prevVersion = settings.version;

  // Check if the extension has been just updated or installed.
  if (currVersion != prevVersion) {
    if (typeof prevVersion == 'undefined') {
      // onInstall: Show Options page.
      chrome.tabs.create({url: 'options.html'});
    }
    else {
      // onUpdate: Do nothing now.
    }
    settings.version = currVersion;
  }

  // Check if the autostart setting is enabled, if it is, automatically start
  // our custom proxy server.
  this.setProxyEnabled(settings.autostart);
};

/**
 * Sets the current proxy server.
 *
 * @param {boolean} status_ True to turn it on, otherwise use the auto_detect
 *                          option to bring it back to normal.
 */
ProxyController.prototype.setProxyEnabled = function (status_)
{
  this.proxyStatus = status_;

  // An object encapsulating a complete proxy configuration.
  var config = {
    mode: this.proxyStatus ? 'fixed_servers' : 'auto_detect',
    rules: {
      singleProxy: {
        scheme: settings.scheme,
        host: settings.host,
        port: settings.port
      },
      bypassList: settings.bypass
    }
  };

  // Describes the current proxy setting being used.
  var proxySettings = {
    'value': config,
    'scope': settings.incognito ? 'incognito_persistent' : 'regular'
  };

  // Change the icon to reflect the current status of the proxy server.
  var icon =

  // Clear settings for both windows.
  chrome.proxy.settings.clear({scope : 'incognito_persistent'});
  chrome.proxy.settings.clear({scope : 'regular'});

  // Setup new settings for the appropriate window.
  chrome.proxy.settings.set(proxySettings, function() {});
  chrome.browserAction.setIcon({ path: this.proxyStatus ? ProxyController.ONLINE_ICON : ProxyController.OFFLINE_ICON });
  chrome.browserAction.setTitle({ title: this.proxyStatus ? 'Online' : 'Offline' });
};

var proxyController = new ProxyController();
proxyController.init();
