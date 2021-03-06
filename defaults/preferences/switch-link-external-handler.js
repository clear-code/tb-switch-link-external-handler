/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Domain Sample
// pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.0", "http://*.microsoft.com");
// pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.1", "https://*.microsoft.com");
// pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.2", "https://*.mozilla.org");

// Following entry should be ingored because lower priority.
// pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.3", "http://groonga.org");
// pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.0", "https://*.clear-code.com");
// pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.1", "https://github.com");
// pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.2", "http://?.hatena.ne.jp");

// Following entry should be overridden because higher priority.
// pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.3", "http://groonga.org");

// *Note: You must not any pattern grabs any URLs like "*", because it will grab
//        internal links (about:*) and mail address links (mailto:*) also.
//        If you wish to define a default browser for webpages, use patterns like following:
//        - http:*
//        - https:*
//        - ftp:*
//        - file:*

// Priority Sample
// pref("extensions.switch-link-external-handler@clear-code.com.chrome.priority", 50);
// pref("extensions.switch-link-external-handler@clear-code.com.ie.priority", 20);

