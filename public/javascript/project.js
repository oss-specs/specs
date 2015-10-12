/*global $*/

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
  var expanded = 0;
  function expandCollapseAll() {
    // Toggle expansion on alternative executions.
    expanded = expanded ^ 1;
    var els;
    els = this.parentElement.getElementsByClassName('directory-path');
    [].forEach.call(els, function(el) {
      if (expanded) {
        el.classList.remove('expand');
      } else {
        el.classList.add('expand');
      }
    });

    els = this.parentElement.getElementsByClassName('file-list');
    [].forEach.call(els, function(el) {
      if (expanded) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });
  }

  var expandCollapseAlEl = window.document.getElementById('expand-collapse-all');
  expandCollapseAlEl.addEventListener('click', expandCollapseAll);
});

// Directory path heading logic.
$(function() {
  var els = window.document.getElementsByClassName('directory-path');
  [].forEach.call(els, function(el) {
    el.addEventListener('click', function() {
      this.classList.toggle('expand'); this.nextElementSibling.classList.toggle('hidden');
    })
  });
});
