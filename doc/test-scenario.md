# 検証手順

## 事前準備

  * IE, Google Chromeが使用可能なWindows環境を用意する。
  * Thunderbirdを起動しプロファイルを作成した状態にしておく
  * AMOにはリリースされていないアドオン
  
## 検証項目

### 指定したパターンに応じてリンクが開かれる

1. prefs.jsに以下の内容を追加する。

user_pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.0", "*://*.clear-code.com");
user_pref("extensions.switch-link-external-handler@clear-code.com.chrome.patterns.1", "*://github.com");
user_pref("extensions.switch-link-external-handler@clear-code.com.chrome.priority", 50);
user_pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.0", "*://github.com");
user_pref("extensions.switch-link-external-handler@clear-code.com.ie.patterns.1", "*://*.mozilla.org");
user_pref("extensions.switch-link-external-handler@clear-code.com.ie.priority", 20);

2. Thunderbirdを起動し、アドオンをインストールする

3. http://www.clear-code.com/ 、 https://github.com/ 、 https://addons.mozilla.org/ 、 http://example.com/ のそれぞれのリンクを含むメールを開く

4. 各リンクを開く


期待される結果： http://www.clear-code.com/ はGoogle Chromeで開かれる
期待される結果： https://github.com/ はGoogle Chromeで開かれる
期待される結果： https://addons.mozilla.org/ はIEで開かれる
期待される結果： http://example.com/ は既定のブラウザで開かれる
