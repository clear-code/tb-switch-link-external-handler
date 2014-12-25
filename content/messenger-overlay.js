/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  const kIEPath = "C:\\Program Files\\Internet Explorer\\iexplore.exe";
  const kChromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
  var urls = ["https://dev.mozilla.jp"];
  var SwitchLinkExternalHandler = {
    startIE: function startIE() {
      this.startExternalProcess(kIEPath, urls);
    },
    startChrome: function startChrome() {
      this.startExternalProcess(kChromePath, urls);
    },
    startExternalProcess: function startExternalProcess(aPath, aURLs) {
      var process = Cc["@mozilla.org/process/util;1"]
                      .createInstance(Ci.nsIProcess);
      var file = Cc["@mozilla.org/file/local;1"]
                   .createInstance(Ci.nsILocalFile);
      file.initWithPath(aPath);
      process.init(file);
      process.run(false, aURLs, aURLs.length);
    },
    run: function run() {
    },
  };

  aGlobal.SwitchLinkExternalHandler = SwitchLinkExternalHandler;
})(this);
