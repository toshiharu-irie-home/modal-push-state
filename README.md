# modal-push-state

## 概要
* このJSは一部Bootstrapに依存しています。
* pushStateを利用して、モーダルウィンドウに一意のURLを持たせることが出来ます。
* モーダルウィンドウ間の移動ができます。
* ページ移動時のタイトルはH1から取得します。
* history.back()、history.forward()、ブラウザーの戻る・進むに対応しています。

## 実装方法

### 親ページ、子ページの用意

親ページ、子ページ (モーダル) 共に以下のようにマークアップします。

```HTML
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>title</title>
  <link rel="stylesheet" href="/demo/css/bootstrap.css">
  <script src="/demo/js/jquery.min.js"></script>
  <script src="/demo/js/bootstrap.min.js"></script>
  <script src="/demo/modal/pushstate/js/modal_pushstate.js"></script>
</head>
<body>
  <div id="js-container">
    <div id="js-article">
    </div>
    <div id="js-modal-content">
      <div class="modal fade" id="js-modal">
        <div id="js-modal-dialog" class="modal-dialog">
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

親ページは#js-article、子ページは#js-modal-dialogの中にコンテンツを記述してください。

さらに、子ページには#js-containerにdata属性を追加します。
* data-parent: 子ページをリロード、または直接アクセスしたとき、モーダルウィンドウの裏側に表示する親ページを指定します。この値を省略すると、子ページとはみなされません。
* data-charset: data-parentで指定した親ページの文字コードが子ページと異なる場合、その文字コードを指定します。この値は省略可能です。
  * 例) 親ページがShift_JIS、子ページがUTF-8の場合
    * <div id="js-container" data-parent="hogehoge.html" data-charset="Shift_JIS">

### モーダルウィンドウのリンク設置

モーダルウィンドウを開くためには、以下のようにマークアップします。
href属性には、作成した子ページのURLを指定してください。

```HTML
<a class="js-modal" href="modal.html">モーダルをひらく</a>
```

この記述は親ページ、子ページどちらに入っていても問題ありません。
子ページにこの記述を入れてリンクをクリックした場合、モーダルウィンドウの中身だけが切り替わります。
