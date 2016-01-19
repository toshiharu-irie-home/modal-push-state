var MODAL = MODAL || {};

(function($){
  'use strict';

  // エレメント管理
  MODAL.option = {
    target: '.js-modal',
    window: '#js-modal',
    content: '#js-modal-dialog',
    back: '.js-back',
    forward: '.js-forward',
    container: '#js-container',
    parent_content: '#js-article',
    has_open: 'modal-open'
  };

  // モーダル移動回数の管理
  MODAL.count = {
    back: -1,
    forward: 0
  };

  /**
   * モーダル間を移動したとき、移動回数をMODAL.count.backオブジェクトに格納。
   * @param {boolean} type
   *    history.back: true
   *    history.forward: false
   */
  MODAL.count_history = function(type){
    if (type) {
      MODAL.count.back++;
    } else {
      if (MODAL.count.forward < MODAL.count.back) {
        // MODAL.count.forwardがModal.count.backより少ない場合のみModal.count.backの値を減らす。
        MODAL.count.back--;
      }
    }
    if (MODAL.count.back === 0) {
      // Modal.count.backが0になってしまう場合、強制的に-1 (1ページ戻る) にする。
      MODAL.count.back--;
    }
  };

  /**
   * ページ移動するとき、それが戻るか進むかを判定。
   * @param {boolean} count
   *    history.back: true
   *    history.forward: false
   * @param {boolean} hidden_modal
   *    モーダルを閉じる動作をしたとき: true
   *    それ以外: false
   */
  MODAL.move_page = function(count, hidden_modal){
    if (history.state.match('modal')) {
      if (hidden_modal && MODAL.count.back !== -1) {
        // モーダルを閉じたとき、MODAL.count.backに格納された数値だけページ移動。
        history.go(MODAL.count.back);
        // MODAL.count.backをリセットする。
        MODAL.count.back = -1;
      } else {
        // 通常のページ移動。
        MODAL.count_history(count);
        if (count) {
          history.back();
        } else {
          history.forward();
        }
      }
    }
  };

  /**
   * モーダルを表示するときの処理。
   * @param {string} path モーダルページのURLを格納。
   * @param {boolean} reload
   * @param char
   */
  MODAL.view = function(path, reload, char){
    var _option = {};
    $.ajaxSetup({
      beforeSend: function(xhr){
        xhr.overrideMimeType('text/html;charset=' + (char ? char : 'UTF-8'));
      }
    });
    $.get(path)
      .then(function(content) {
        if (reload) {
          // path引数から取得したページ情報をモーダル外に追加する
          $(MODAL.option.container).prepend($(content).find(MODAL.option.parent_content));
        } else {
          // path引数から取得したモーダル情報をページ内に追加する
          $(MODAL.option.window).html($(content).find(MODAL.option.content));
        }
        $('title').text($(MODAL.option.window).find('h1').text());
      });
    if (!reload) {
      _option = {
        remote: path
      };
    }
    // モーダルを開く
    $(MODAL.option.window).modal(_option);
  };

  $(function(){
    $(window).on('load', function(){
      if (history.state === null) {
        history.replaceState('parent', null, location.pathname);
      }
    });

    $(document).on('click', MODAL.option.target, function (e) {
      e.preventDefault();
      var _path = $(this).attr('href');
      if (history.state.match('modal')) {
        // モーダル内移動をしたとき、カウントを増加して、MODAL.count.forwardにカウント最大値を記憶
        MODAL.count.back--;
        MODAL.count.forward = MODAL.count.back;
      }
      var _charset = $(this).data('charset') ? $(this).data('charset') : 'UTF-8';
      MODAL.view(_path, false, _charset);
      history.pushState('modal' + MODAL.count.back, '', _path);
    });

    $(document).on('hidden.bs.modal', function () {
      if (history.state.match('modal')) {
        MODAL.move_page(true, true);
      }
      $('title').text($(MODAL.option.parent_content).find('h1').text());
    });

    window.addEventListener('popstate', function() {
      var _state = history.state;
      if (!_state) { // ヒストリー操作時にstate (モーダルを開いている証拠) があるか
        if ($('body').hasClass(MODAL.option.has_open)) { // stateが無い、かつモーダルが開いている
          $('.' + MODAL.option.has_open + ' ' + MODAL.option.window).modal('hide');
        } else {
          // ページをリロードする。
          location.reload();
        }
      } else {
        if (_state.match('modal')) {
          MODAL.view(location.href);
          MODAL.count.back = parseInt(_state.split('modal')[1], 10);
        }
        if (_state.match('parent')) {
          if ($('body').hasClass(MODAL.option.has_open)) {
            $('.' + MODAL.option.has_open + ' ' + MODAL.option.window).modal('hide');
          }
        }
      }
    });

    $(document).on('click', MODAL.option.back, function(e){
      // 戻るリンクを押したときの処理。
      e.preventDefault();
      MODAL.move_page(true);
    });

    $(document).on('keydown', function(e){
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.keyCode === 8 && history.state) {
          // BackSpaceキーを押したときの処理。
          e.preventDefault();
          MODAL.move_page(true);
        }
      }
    });

    $(document).on('click', MODAL.option.forward, function(e){
      // 進むリンクを押したときの処理。
      e.preventDefault();
      MODAL.move_page(false);
    });

    // モーダルウィンドウを直接開いた時
    if ($(MODAL.option.container).data('parent')) {
      var _parent_path = $(MODAL.option.container).data('parent'),
          _parent_charset = $(MODAL.option.container).data('charset') ? $(MODAL.option.container).data('charset') : 'UTF-8',
          _path = location.href;
      // history.backしたときにページ情報取得元のURLをヒストリーに記憶
      if (history.state === null) {
        history.replaceState('parent', '', _parent_path);
        history.pushState('modal', '', _path);
      }
      MODAL.view(_parent_path, true, _parent_charset);
    }

  });
}(jQuery));