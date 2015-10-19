'use strict';

// Expand/collapse tags.
$(function() {
  function expandCollapseTags() {
    var tagEls = window.document.getElementsByClassName('tags');
    [].forEach.call(tagEls, function(el) {
      el.classList.toggle('collapse');
    });
  }

  var expandCollapseTagsEl = window.document.getElementById('expand-collapse-tags');
  expandCollapseTagsEl.addEventListener('click', expandCollapseTags);
});
