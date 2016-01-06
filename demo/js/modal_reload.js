/**
* @license  Copyright (c) 2015 Toshiharu Irie.
* This script released under the MIT license (MIT-LICENSE.txt).
*/

(function($){
  'use strict';

  $(function(){
    var parent_path = $('#container').data('parent'),
        path = location.href,
        state = {
          action: 'modal'
        };
    // history.backしたときにページ情報取得元のURLをヒストリーに記憶
    history.replaceState(null, '', parent_path);
    MODAL.view(parent_path, true);
    history.pushState(state, '', path);
  });

}(jQuery));