/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (aGlobal) {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var process = Cc["@mozilla.org/process/util;1"]
                  .createInstance(Ci.nsIProcess);
  var file = Cc["@mozilla.org/file/local;1"]
               .createInstance(Ci.nsILocalFile);
  const kIEPath = "C:\\Program Files\\Internet Explorer\\iexplore.exe";
  const kChromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

  var SwitchLinkExternalHandler = {
    run: function run() {
    },
  };

  aGlobal.SwitchLinkExternalHandler = SwitchLinkExternalHandler;
})(this);
