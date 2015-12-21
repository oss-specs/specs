/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  // Is everything except the tags button collapsed?
  function everythingIsCollapsed() {
    var collapsableEls = window.document.getElementsByClassName('collapsible');
    return [].every.call(collapsableEls, function(el) {
      return el.classList.contains('collapse') || el.id === 'expand-collapse-tags';
    });
  }

  // Expand/collapse all details.
  $(function() {
    var doExpand = true;

    function expandCollapseDetails() {
      var featureTitleEl = window.document.getElementById('feature-title');
      var tagsButtonEl = window.document.getElementById('expand-collapse-tags');
      var featureDetailsEls = window.document.getElementsByClassName('feature-details');
      var scenarioDetailsEls = window.document.getElementsByClassName('scenario-details');

      if (doExpand) {
        featureTitleEl.classList.remove('can-expand');
        tagsButtonEl.classList.remove('collapse');
      } else {
        featureTitleEl.classList.add('can-expand');
        tagsButtonEl.classList.add('collapse');
      }

      [].forEach.call(featureDetailsEls, function(el) {
        if (doExpand) {
          el.classList.remove('collapse');
        } else {
          el.classList.add('collapse');
        }
      });
      [].forEach.call(scenarioDetailsEls, function(el) {

        // Only toggle the can-expand class once per scenario
        // (a scenario can have multiple scenario-detail children).
        var nextSibling = el.nextElementSibling;
        var titleParent = null;
        if (nextSibling.classList.contains('scenario-title')) {
          titleParent = nextSibling.parentNode;
        }

        if (doExpand) {
          el.classList.remove('collapse');

          // The `can-expand` class drives the UI display of the
          // symbols hinting that an element is expandable.
          if (titleParent) {
            titleParent.classList.remove('can-expand');
          }
        } else {
          el.classList.add('collapse');
          if (titleParent) {
            titleParent.classList.add('can-expand');
          }
        }
      });

      // Toggle expansion on alternative executions.
      doExpand = !doExpand;
    }

    var expandCollapseDetailsEl = window.document.getElementById('expand-collapse-details');
    if (expandCollapseDetailsEl !== null) {
      expandCollapseDetailsEl.addEventListener('click', expandCollapseDetails);
    }
  });

  // Expand/collapse individual scenarios.
  $(function() {
    var tagsButtonEl = window.document.getElementById('expand-collapse-tags');
    var scenarioTitleEls = window.document.getElementsByClassName('scenario-title');
    [].forEach.call(scenarioTitleEls, function(scenarioTitleEl) {
      scenarioTitleEl.addEventListener('click', function() {
        // Get scenario-details children of the scenario.
        var scenarioEl = this.parentNode;
        var scenarioDetailsEls = scenarioEl.getElementsByClassName('scenario-details');

        var isCollapsed = scenarioEl.classList.contains('can-expand');
        if (isCollapsed) {
          // Expand.
          scenarioEl.classList.remove('can-expand');
          [].forEach.call(scenarioDetailsEls, function(detailsEl) {
            detailsEl.classList.remove('collapse');
          });

          // Show tags button
          tagsButtonEl.classList.remove('collapse');
        } else {
          // Collapse.
          scenarioEl.classList.add('can-expand');
          [].forEach.call(scenarioDetailsEls, function(detailsEl) {
            detailsEl.classList.add('collapse');
          });

          // Conditionally hide the tags button.
          if (everythingIsCollapsed()) {
            tagsButtonEl.classList.add('collapse');
          }
        }
      });
    });
  });

  // Expand/collapse the Feature details.
  $(function() {
    var tagsButtonEl = window.document.getElementById('expand-collapse-tags');
    var featureTitleEl = window.document.getElementById('feature-title');

    if (featureTitleEl === null ) {
      return;
    }

    featureTitleEl.addEventListener('click', function() {
      var featureDetailsEls = window.document.getElementsByClassName('feature-details');

      var isCollapsed = this.classList.contains('can-expand');
      if (isCollapsed) {
        // Expand.
        this.classList.remove('can-expand');
        [].forEach.call(featureDetailsEls, function(el) {
          el.classList.remove('collapse');
        });

        // Show tags button
        tagsButtonEl.classList.remove('collapse');
      } else {
        // Collapse.
        this.classList.add('can-expand');
        [].forEach.call(featureDetailsEls, function(el) {
          el.classList.add('collapse');
        });

        // Conditionally hide the tags button.
        if (everythingIsCollapsed()) {
          tagsButtonEl.classList.add('collapse');
        }
      }
    });
  });

  // Expand/collapse all tags.
  $(function() {
    function expandCollapseTags() {
      var tagEls = window.document.getElementsByClassName('tags');
      [].forEach.call(tagEls, function(el) {
        el.classList.toggle('collapse');
      });
    }

    var expandCollapseTagsEl = window.document.getElementById('expand-collapse-tags');
    if (expandCollapseTagsEl !== null) {
      expandCollapseTagsEl.addEventListener('click', expandCollapseTags);
    }
  });

})();
