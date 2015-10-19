'use strict';

// Expand/collapse details.
$(function() {
  var doExpand = 1

  function expandCollapseDetails() {
    var featureDetailsEls = window.document.getElementsByClassName('feature-details');
    var scenarioDetailsEls = window.document.getElementsByClassName('scenario-details');

    [].forEach.call(featureDetailsEls, function(el) {
      if (doExpand) {
        el.classList.remove('collapse');
      } else {
        el.classList.add('collapse');
      }
    });
    [].forEach.call(scenarioDetailsEls, function(el) {
      if (doExpand) {
        el.classList.remove('collapse');
      } else {
        el.classList.add('collapse');
      }
    });

    // Toggle expansion on alternative executions.
    doExpand = doExpand ^ 1;
  }

  var expandCollapseDetailsEl = window.document.getElementById('expand-collapse-details');
  expandCollapseDetailsEl.addEventListener('click', expandCollapseDetails);
});


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
