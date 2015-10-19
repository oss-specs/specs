'use strict';

// Expand/collapse details.
$(function() {
  function expandCollapseDetails() {
    var featureDetailsEls = window.document.getElementsByClassName('feature-details');
    var scenarioDetailsEls = window.document.getElementsByClassName('scenario-details');
    [].forEach.call(featureDetailsEls, function(el) {
      el.classList.toggle('collapse');
    });
    [].forEach.call(scenarioDetailsEls, function(el) {
      el.classList.toggle('collapse');
    });
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
