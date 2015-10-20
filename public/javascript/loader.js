/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  $(function() {
    var loaderButtons = window.document.querySelectorAll('button.loader-button');
    [].forEach.call(loaderButtons, function(loaderButton) {
      loaderButton.addEventListener('click', function() {
        window.document.body.classList.add('waiting');
      });
    });
  });

})();
