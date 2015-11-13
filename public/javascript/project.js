/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  function getQueryParams(urlString) {
    var url = new window.URL(urlString);
    var search = url.search.replace(/^\?/,'');
    var params = [];
    var parsedParams = {};
    if (!search.length) {
      return parsedParams;
    }
    params = search.split('&');
    params.forEach(function(param) {
      param = param.split('=');
      parsedParams[param[0]] = param[1];
    });
    return parsedParams;
  }

  function generateQueryString(queryParams) {
    return Object.keys(queryParams).reduce(function(soFar, key, index, keys) {
      var value = queryParams[key];
      var isFinal = (index === keys.length-1);
      var param;
      if (value !== undefined) {
        param = soFar + key + '=' + value;
      } else {
        param = soFar + key;
      }
      if (!isFinal) {
        param += '&';
      }
      return param;
    }, '?');
  }

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

  // View changing select element logic change-branch-control
  $(function() {
    var selectEl = $('#change-views-control');

    // On change, reload the page with a new query param dictating configured view.
    if (selectEl) {
      selectEl.on('change', function() {
        window.location.href = window.location.pathname + '?view=' + this.value;
      });
    }
  });

  // Expand/collapse repository controls.
  $(function() {
    var openBurgerMenu;

    function expandCollapseRepoControls() {
      var repoControlsEl = window.document.getElementById('repository-controls');
      var burgerMenuEl = window.document.getElementById('expand-collapse-repository-controls');

      repoControlsEl.classList.toggle('collapse');
      openBurgerMenu = !repoControlsEl.classList.contains('collapse');

      if (openBurgerMenu) {
        burgerMenuEl.classList.add('open');
      } else {
        burgerMenuEl.classList.remove('open');
      }

      // Persist the burger menu state in a cookie for five minutes.
      window.document.cookie = 'specsOpenBurgerMenu=' + openBurgerMenu + ';max-age=' + 5 * 60;
    }

    var expandCollapseRepoControlsEl = window.document.getElementById('expand-collapse-repository-controls');
    expandCollapseRepoControlsEl.addEventListener('click', expandCollapseRepoControls);
  });

  // Expand/collapse file lists button logic.
  $(function() {
    var directoryEls = window.document.getElementsByClassName('directory-path');
    var doExpand = [].every.call(directoryEls, function(el) { return el.classList.contains('can-expand'); });

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
      doExpand = !doExpand;
    }

    var expandCollapseAlEl = window.document.getElementById('expand-collapse-file-lists');
    expandCollapseAlEl.addEventListener('click', expandCollapseAll);
  });

  // Expand/collapse individual directories.
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

  // Tag selecting element logic.
  $(function() {
    var selectEl = $('#select-tag-control');

    // Set up the searchable select box jquery widget.
    selectEl.select2();

    // On change, reload the page with a query param
    // determining feature tag to filter on.
    selectEl.on('change', function() {
      var tag = this.value;
      var queryParams = getQueryParams(window.location.href);

      // Modify the query params to replace or create on for the current tag.
      queryParams['tags'] = tag;

      window.location.href = window.location.pathname + generateQueryString(queryParams);
    });
  });

  // Override clicking on feature links when a scenario summary has been
  // clicked so that a query param and hash-fragment can be appended.
  $(function() {
    var specLinkEls = window.document.getElementsByClassName('spec-link');
    [].forEach.call(specLinkEls, function(el) {
      el.addEventListener('click', function(event) {
        var sourceEl = event.srcElement;
        var targetScenarioId;
        var targetUrl;
        var queryParams;
        if (sourceEl.classList.contains('scenario-summary')) {
          targetScenarioId = sourceEl.dataset.scenarioEncodedName;

          // This click originated on a scenario summary and the requested
          // URL should be modified.
          if (targetScenarioId !== undefined) {
            event.preventDefault();

            targetUrl = new window.URL(el.href);
            queryParams = getQueryParams(targetUrl.href);

            // Modify the query params so the server can know which scenario
            // was requested.
            queryParams['scenario'] = targetScenarioId;
            targetUrl.search = generateQueryString(queryParams);

            // Add a hash fragment so that the named scenario is brought
            // into view on navigation.
            targetUrl.hash = '#' + targetScenarioId;
            window.location.href = targetUrl.toString();
          }
        }
      });
    });
  });

})();
