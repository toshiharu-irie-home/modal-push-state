/**
* @license  Copyright (c) 2015 Toshiharu Irie.
* This script released under the MIT license (MIT-LICENSE.txt).
*/

var MODAL = MODAL || {};

(function($){
  'use strict';

  // エレメント管理
  MODAL.option = {
    target: '.js-modal',
    window: '#myModal',
    content: '#modal-dialog',
    back: '.js-back',
    forward: '.js-forward',
    container: '#container',
    parent_content: '#article'
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
    var current_state = history.state;
    if (current_state) {
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
   */
  MODAL.view = function(path, reload){
    var option = {};
    $.get(path)
      .then(function(content) {
        if (reload) {
          // path引数から取得したページ情報をモーダル外に追加する
          $(MODAL.option.container).prepend($(content).find(MODAL.option.parent_content));
        } else {
          // path引数から取得したモーダル情報をページ内に追加する
          $(MODAL.option.window).html($(content).find(MODAL.option.content));
        }
      });
    if (!reload) {
      option = {
        remote: path
      };
    }
    // モーダルを開く
    $(MODAL.option.window).modal(option);
  };

  $(function(){
    $(document).on('click', MODAL.option.target, function (e) {
      e.preventDefault();
      var path = $(this).attr('href'),
          state = {
            action: 'modal'
          };
      if (history.state) {
        // モーダル内移動をしたとき、カウントを増加して、MODAL.count.forwardにカウント最大値を記憶
        MODAL.count.back--;
        MODAL.count.forward = MODAL.count.back;
      }
      MODAL.view(path);

      // モーダルを開く処理をしたとき、常にURLを書き換え、stateにモーダルを開いている証拠を残す
      history.pushState(state, '', path);
    });

    $(document).on('hidden.bs.modal', function () {
      MODAL.move_page(true, true);
    });

    window.addEventListener('popstate', function() {
      var state = history.state;
      if (!state) { // ヒストリー操作時にstate (モーダルを開いている証拠) があるか
        if ($('body').hasClass('modal-open')) { // stateが無い、かつモーダルが開いている
          $('.modal-open #myModal').modal('hide');
        } else {
          // ページをリロードする。
          location.reload();
        }
      } else {
        // stateがあればモーダルの中身を別の中身に入れ替える
        MODAL.view(location.href);
      }
    });

    $(document).on('click', MODAL.option.back, function(e){
      // 戻るリンクを押したときの処理。
      e.preventDefault();
      MODAL.move_page(true);
    });

    $(document).on('keydown', function(e){
      if (e.keyCode === 8) {
        // BackSpaceキーを押したときの処理。
        e.preventDefault();
        MODAL.move_page(true);
      }
    });

    $(document).on('click', MODAL.option.forward, function(e){
      // 進むリンクを押したときの処理。
      e.preventDefault();
      MODAL.move_page(false);
    });

  });
}(jQuery));