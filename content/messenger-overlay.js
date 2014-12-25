/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Pref = Cc['@mozilla.org/preferences;1']
                 .getService(Ci.nsIPrefBranch);
  const kIEPath = "C:\\Program Files\\Internet Explorer\\iexplore.exe";
  const kChromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  const kPrefPrefix = "extensions.switch-link-external-handler@clear-code.com.";
  const kIEPatternsPref = kPrefPrefix +  "ie.petterns.";
  const kChromePatternsPref = kPrefPrefix + "chrome.patterns.";
  var SwitchLinkExternalHandler = {
    startIE: function startIE(aURL) {
      this.startExternalProcess(kIEPath, aURL);
    },
    startChrome: function startChrome(aURL) {
      this.startExternalProcess(kChromePath, aURL);
    },
    startExternalProcess: function startExternalProcess(aPath, aURL) {
      var process = Cc["@mozilla.org/process/util;1"]
                      .createInstance(Ci.nsIProcess);
      var file = Cc["@mozilla.org/file/local;1"]
                   .createInstance(Ci.nsILocalFile);
      var args = [aURL];
      file.initWithPath(aPath);
      process.init(file);
      process.run(false, args, args.length);
    },
    run: function run(aURL) {
      this.startIE(aURL);
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

  var browser = document.getElementById("messagepane");
  browser.addEventListener("click", function onClick(aEvent) {
    let href = hRefForClickEvent(aEvent);
    if (href.match(/^https?:/)) {
      SwitchLinkExternalHandler.run(href);
      aEvent.preventDefault();
      aEvent.stopPropagation();
    }
  }, true);
  aGlobal.SwitchLinkExternalHandler = SwitchLinkExternalHandler;
})(this);
