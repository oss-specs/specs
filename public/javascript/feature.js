/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  // Expand/collapse all details.
  $(function() {
    var doExpand = true;

    function expandCollapseDetails() {
      var featureTitleEl = window.document.getElementById('feature-title');
      var featureDetailsEls = window.document.getElementsByClassName('feature-details');
      var scenarioDetailsEls = window.document.getElementsByClassName('scenario-details');

      if (doExpand) {
        featureTitleEl.classList.remove('can-expand');
      } else {
        featureTitleEl.classList.add('can-expand');
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
          if (titleParent) titleParent.classList.remove('can-expand');
        } else {
          el.classList.add('collapse');
          if (titleParent) titleParent.classList.add('can-expand');
        }
      });

      // Toggle expansion on alternative executions.
      doExpand = !doExpand;
    }

    var expandCollapseDetailsEl = window.document.getElementById('expand-collapse-details');
    expandCollapseDetailsEl.addEventListener('click', expandCollapseDetails);
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
    expandCollapseTagsEl.addEventListener('click', expandCollapseTags);
  });

  // Expand/collapse individual scenarios.
  $(function() {
    var scenarioTitleEls = window.document.getElementsByClassName('scenario-title');
    [].forEach.call(scenarioTitleEls, function(scenarioTitleEl) {
      scenarioTitleEl.addEventListener('click', function() {
        // Get scenario-details children of the scenario.
        var scenarioEl = this.parentNode;
        var scenarioDetailsEls = scenarioEl.getElementsByClassName('scenario-details');

        scenarioEl.classList.toggle('can-expand');
        [].forEach.call(scenarioDetailsEls, function(detailsEl) {
          detailsEl.classList.toggle('collapse');
        });
      });
    });
  });

  // Expand/collapse the Feature details.
  $(function() {
    var featureTitleEl = window.document.getElementById('feature-title');
    featureTitleEl.addEventListener('click', function() {
      this.classList.toggle('can-expand');
      var featureDetailsEls = this.parentNode.getElementsByClassName('feature-details');
      [].forEach.call(featureDetailsEls, function(el) {
        el.classList.toggle('collapse');
      });
    });
  });

})();
