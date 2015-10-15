/* eslint-env browser */
/* global $ */

// Branch changing select element logic.
$(function() {
  var selectEl = $('#change-branch-control');

  // Set up the searchable select box jquery widget.
  selectEl.select2();

  // On change, reload the page with a new query param dictating target branch.
  selectEl.on('change', function() {
    window.location.href = window.location.pathname + '?branch=' + this.value;
  });
});

// Hide/collapse all button logic.
$(function() {
  var doExpand = 0;
  function expandCollapseAll() {
    var els;
    var parent = document.getElementsByClassName('spec-links')[0];
    els = parent.getElementsByClassName('directory-path');
    [].forEach.call(els, function(el) {
      if (doExpand) {
        el.classList.remove('can-expand');
      } else {
        el.classList.add('can-expand');
      }
    });


    els = parent.getElementsByClassName('file-list');
    [].forEach.call(els, function(el) {
      if (doExpand) {
        el.classList.remove('collapse');
      } else {
        el.classList.add('collapse');
      }
    });

    // Toggle expansion on alternative executions.
    doExpand = doExpand ^ 1;
  }

  var expandCollapseAlEl = window.document.getElementById('expand-collapse-all');
  expandCollapseAlEl.addEventListener('click', expandCollapseAll);
});

// Directory path heading logic.
$(function() {
  var els = window.document.getElementsByClassName('directory-path');
  [].forEach.call(els, function(el) {
    el.addEventListener('click', function() {
      this.classList.toggle('can-expand');

      // Expand or collapse the file list.
      this.nextElementSibling.classList.toggle('collapse');
    });
  });
});
