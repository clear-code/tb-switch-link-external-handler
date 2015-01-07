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
  const kIEPatternsPref = kPrefPrefix +  "ie.patterns.";
  const kChromePatternsPref = kPrefPrefix + "chrome.patterns.";
  var { inherit } = Cu.import("resource://switch-link-external-handler-modules/inherit.jsm", {});

  function BrowserBase() {}
  BrowserBase.prototype = {
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
      file.initWithPath(exePath);
      process.init(file);
      process.run(false, args, args.length);
    },

    urlMatcher: function urlMatcher(aPatternsPref) {
      var patterns = [];
      dump(aPatternsPref + "\n");
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
        }
      }, this);
      if (patterns.length > 0) {
        return new RegExp("^(" + patterns.join("|") + ")", "i");
      }
      else {
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
     get commandLine() {
      if (!this._commandLine) {
        var commandLine = Registry.readRegKey(
          Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
          "Applications\\iexplore.exe\\shell\\open\\command",
          ""
        );
        this._commandLine = this.shellSplit(commandLine);
      }

      return this._commandLine;
    },

    get matcher() {
      if (!this._matcher)
        this._matcher = this.urlMatcher(kIEPatternsPref);

      return this._matcher;
    }
  });

  function Chrome() {}
  Chrome.prototype = inherit(BrowserBase.prototype, {
    get commandLine() {
      if (!this._commandLine) {
        let chromeRegistryKeys = [
          {key: Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
           path: "ChromeHTML\\shell\\open\\command", name: "", append: ""},
          {key: Ci.nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT,
           path: "Applications\\chrome.exe\\shell\\open\\command", name: "", append: ""},
          {key: Ci.nsIWindowsRegKey.ROOT_KEY_CURRENT_USER,
           path: "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome",
           name: "InstallLocation", append: "\\chrome.exe -- \"%1\""}
        ];
        var ChromeCommandLine;
        chromeRegistryKeys.some(function (aKey) {
          var commandLine = Registry.readRegKey(
            aKey.key,
            aKey.path,
            aKey.name
          );
          if (commandLine) {
            ChromeCommandLine = commandLine + aKey.append;
            return true;
          }
          else {
            return false;
          }
        }, this);
        this._commandLine = this.shellSplit(ChromeCommandLine);
      }
      return this._commandLine;
    },

    get matcher() {
      if (!this._matcher)
        this._matcher = this.urlMatcher(kChromePatternsPref);

      return this._matcher;
    }
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

    onLinkClick: function onLinkClick(aEvent) {
      let href = hRefForClickEvent(aEvent);

      if (!href)
        return;

      if (href.match(this.Chrome.matcher)) {
        this.Chrome.start(href);
      }
      else if (href.match(this.IE.matcher)) {
        this.IE.start(href);
      }
      else {
        return;
      }
      aEvent.preventDefault();
      aEvent.stopPropagation();
    }
  };

  var browser = document.getElementById("messagepane");
  browser.addEventListener("click", function onClick(aEvent) {
    SwitchLinkExternalHandler.onLinkClick(aEvent);
  }, true);
  aGlobal.SwitchLinkExternalHandler = SwitchLinkExternalHandler;
})(this);
