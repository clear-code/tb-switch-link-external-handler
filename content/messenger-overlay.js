/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;
  const Pref = Cc['@mozilla.org/preferences;1']
                 .getService(Ci.nsIPrefBranch);
  const Registry = Cu.import("resource://gre/modules/WindowsRegistry.jsm")
                     .WindowsRegistry;
  const kPrefPrefix = "extensions.switch-link-external-handler@clear-code.com.";
  var { inherit } = Cu.import("resource://switch-link-external-handler-modules/lib/inherit.jsm", {});

  function log(aMessage) {
    Cc['@mozilla.org/steel/application;1']
      .getService(Ci.steelIApplication)
      .console.log(aMessage);
  }

  function BrowserBase() {}
  BrowserBase.prototype = {
    get commandLine() {
      if (!this._commandLine) {
        for (var i = 0, length = this.RegistryKeys.length; i < length; ++i) {
          let aKey = this.RegistryKeys[i];
          log(this.name + ': trying to get command line from '+JSON.stringify(aKey));
          let commandLine = Registry.readRegKey(
            aKey.key,
            aKey.path,
            aKey.name
          );
          log(this.name + ':   commandLine => '+JSON.stringify(commandLine));
          if (commandLine) {
            this._commandLine = this.shellSplit(commandLine + aKey.append);
            log(this.name + ':      => '+JSON.stringify(this._commandLine));
            break;
          }
        }
      }
      return this._commandLine;
    },

    get matcher() {
      if (!this._matcher)
        this._matcher = this.urlMatcher(kPrefPrefix + this.name + ".patterns.");

      return this._matcher;
    },

    test: function test(aHref) {
      var matcher = this.matcher;
      if (!matcher)
        return false;

      var matched = matcher.test(aHref);
      log(this.name + ': testing '+aHref+' with '+this.matcher + ' => '+matched);
      return matched;
    },

    start: function start(aURL) {
      this.startExternalProcess(this.commandLine, aURL);
    },

    startExternalProcess: function startExternalProcess(aCommandLine, aURL) {
      var process = Cc["@mozilla.org/process/util;1"]
                      .createInstance(Ci.nsIProcess);
      var file = Cc["@mozilla.org/file/local;1"]
                   .createInstance(Ci.nsILocalFile);
      var exePath = aCommandLine[0];
      var args = [];
      var placeholderFound = false;
      for (var i = 1, length = aCommandLine.length; i < length; ++i) {
        if (aCommandLine[i].indexOf("%1") >= 0) {
          placeholderFound = true;
        }
        args.push(aCommandLine[i].replace("%1", aURL));
      }
      if (!placeholderFound) {
        args.push(aURL);
      }
      log(this.name + ': starting '+exePath+' with args: '+JSON.stringify(args));
      file.initWithPath(exePath);
      process.init(file);
      process.run(false, args, args.length);
    },

    urlMatcher: function urlMatcher(aPatternsPref) {
      log(this.name + ': building matcher');
      var patterns = [];
      try {
      Pref.getChildList(aPatternsPref, {}).forEach(function(aPref) {
        try {
          if (Pref.getPrefType(aPref) != Pref.PREF_STRING)
            return;
          let pattern = this.getStringPref(aPref, '');
          pattern = pattern.trim();
          if (!pattern)
            return;

          pattern = pattern.replace(/([$^\|.{}\[\]()+\\])/g, "$1")
                           .replace(/\*/g, ".*")
                           .replace(/\?/g, ".");
          patterns.push(pattern);
        }
        catch(e) {
          dump(e + "\n");
          Components.utils.reportError(e);
        }
      }, this);
      log('patterns = '+patterns);
      if (patterns.length > 0) {
        return new RegExp("^(" + patterns.join("|") + ")", "i");
      }
      else {
        return null;
      }
      }
      catch(error) {
        Components.utils.reportError(error);
        return null;
      }
    },

    shellSplit: function shellSplit(aString) {
      var splitStrings = [];
      var buff = "";
      var inQuote = false;
      for (var i = 0, strLength = aString.length; i < strLength; ++i) {
        let char = aString.charAt(i);
        switch (char) {
        case '"':
          if (inQuote) {
            splitStrings.push(buff);
            buff = "";
            inQuote = false;
          }
          else {
            inQuote = true;
          }
          break;
        case ' ':
          if (inQuote) {
            buff += char;
          }
          else if (buff != "") {
            splitStrings.push(buff);
            buff = "";
          }
          break;
        default:
          buff += char;
        }
      }
      if (buff != '') {
        splitStrings.push(buff);
      }
      return splitStrings;
    },

    get priority() {
      try {
        return Pref.getIntPref(kPrefPrefix + this.name + ".priority");
      }
      catch(e) {
      }
      return 0;
    },

    getStringPref: function getStringPref(aKey, aDefault) {
      try {
        return Pref.getComplexValue(aKey, Ci.nsISupportsString).data;
      }
      catch(e) {
      }
      return aDefault || '';
    },

    setStringPref: function setStringPref(aKey, aValue) {
      var str = Cc["@mozilla.org/supports-string;1"]
                  .createInstance(Ci.nsISupportsString);
      str.data = aValue;
      try {
        Pref.setComplexValue(aKey, Ci.nsISupportsString, str);
      }
      catch(e) {
      }
    }
  };

  function IE() {}
  IE.prototype = inherit(BrowserBase.prototype, {
    RegistryKeys : [
      {key:    Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
       path:   "Applications\\iexplore.exe\\shell\\open\\command",
       name:   "",
       append: ""}
    ],

    name: "ie"
  });

  function Chrome() {}
  Chrome.prototype = inherit(BrowserBase.prototype, {
    RegistryKeys: [
      {key:    Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
       path:   "ChromeHTML\\shell\\open\\command",
       name:   "",
       append: ""},
      {key:    Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
       path:   "Applications\\chrome.exe\\shell\\open\\command",
       name:   "",
       append: ""},
      {key:    Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
       path:   "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome",
       name:   "InstallLocation",
       append: "\\chrome.exe -- \"%1\""}
    ],

    name: "chrome"
  });

  var SwitchLinkExternalHandler = {
    get IE() {
      delete this.IE;
      return this.IE = new IE();
    },

    get Chrome() {
      delete this.Chrome;
      return this.Chrome = new Chrome();
    },

    get browsers() {
      delete this.browsers;
      var browsers = [this.IE, this.Chrome];
      browsers.sort(function (a, b) {
        return b.priority - a.priority;
      });
      return this.browsers = browsers;
    },

    onLinkClick: function onLinkClick(aEvent) {
      let href = hRefForClickEvent(aEvent);
      log('link clicked, @href = '+href);

      if (!href)
        return;

      try {
      for (var i = 0, length = this.browsers.length; i < length; ++i) {
        let aBrowser = this.browsers[i];
        log('try to test '+aBrowser.name);
        if (aBrowser.test(href)) {
          log(aBrowser.name+' matched');
          aBrowser.start(href);
          aEvent.preventDefault();
          aEvent.stopPropagation();
          return;
        }
      }
      log('no match');
      }
      catch(error) {
        Components.utils.reportError(error);
      }
    }
  };

  var browser = document.getElementById("messagepane");
  browser.addEventListener("click", function onClick(aEvent) {
    SwitchLinkExternalHandler.onLinkClick(aEvent);
  }, true);
  aGlobal.SwitchLinkExternalHandler = SwitchLinkExternalHandler;
})(this);
