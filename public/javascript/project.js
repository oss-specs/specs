/* eslint-env browser */
/* global $, lscache */

(function() {
  'use strict';

  var lscacheTimeoutMins = 30;

  function getQueryParams(urlString) {
    var search;

    // IE11 doesn't support the URL API.
    // If the API doesn't work then
    // don't try and preserve the
    // search parameters.
    try {
      var url = new window.URL(urlString);
      search = url.search.replace(/^\?/,'');
    } catch (err) {
      /* eslint-disable no-console */
      console.warn('URL API not supported');
      console.warn(err);
      /* eslint-enable no-console */
      search = '';
    }
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

  function cache(doExpand, id) {
    lscache.set(id, {expanded: doExpand}, lscacheTimeoutMins);
  }

  function setExpandClass(doExpand, el, className) {
    if (doExpand) {
      el.classList.remove(className);
    } else {
      el.classList.add(className);
    }
  }

  function expandOrCollapse(doExpand, els, className, doCache) {
    [].forEach.call(els, function(el) {
      setExpandClass(doExpand, el, className);
      if (doCache) {
        cache(doExpand, el.id);
      }
    });
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

    // Set up the searchable select box jquery widget.
    selectEl.select2();

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

      setExpandClass(!openBurgerMenu, burgerMenuEl, 'open');

      // Persist the burger menu state in a cookie for five minutes.
      window.document.cookie = 'specsOpenBurgerMenu=' + openBurgerMenu + ';max-age=' + 5 * 60;
    }

    var expandCollapseRepoControlsEl = window.document.getElementById('expand-collapse-repository-controls');
    expandCollapseRepoControlsEl.addEventListener('click', expandCollapseRepoControls);
  });


  // Expand/collapse file lists button logic.
  $(function() {
    var directoryEls = window.document.getElementsByClassName('directory-path');

    function expandCollapseAll() {
      var els;
      var doExpand = [].every.call(directoryEls, function(el) { return el.classList.contains('can-expand'); });
      var parent = document.getElementsByClassName('spec-links')[0];
      var doCache = true;

      els = parent.getElementsByClassName('directory-path');
      expandOrCollapse(doExpand, els, 'can-expand', doCache);

      els = parent.getElementsByClassName('file-list');
      expandOrCollapse(doExpand, els, 'collapse');
    }

    var expandCollapseAllEl = window.document.getElementById('expand-collapse-file-lists');
    expandCollapseAllEl.addEventListener('click', expandCollapseAll);
  });

  // Expand/collapse individual directories based on interactions.
  $(function() {
    var els = window.document.getElementsByClassName('directory-path');
    [].forEach.call(els, function(el) {
      el.addEventListener('click', function() {

        // Expand or collapse the file list.
        var doExpand = this.classList.contains('can-expand');
        setExpandClass(doExpand, this, 'can-expand');
        setExpandClass(doExpand, this.nextElementSibling, 'collapse');
        cache(doExpand, this.id);
      });
    });
  });

  // Expand/collapse individual directories based local state
  $(function() {
    var els = window.document.getElementsByClassName('directory-path');
    [].forEach.call(els, function(el) {
      var id = el.id;
      var state = lscache.get(id);
      var doExpand;
      if (state) {
        doExpand = state.expanded === true;

        // Expand or collapse elements dependending on the value of doExpand.
        setExpandClass(doExpand, el, 'can-expand');
        setExpandClass(doExpand, el.nextElementSibling, 'collapse');
      }
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
      queryParams.tags = tag;

      window.location.href = window.location.pathname + generateQueryString(queryParams);
    });
  });

  // Edit button functionality
  $(function() {
    $('.feature-edit').click(function(event) {
      event.preventDefault();
      var editUrl = this.dataset.editUrl;
      if (!editUrl) {
        throw new TypeError('Edit URL not supplied.');
      }
      window.location.href = editUrl;
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

            // IE11 doesn't support the URL API.
            // If the API isn't supported just
            // follow the feature file link.
            try {
              targetUrl = new window.URL(el.href);
            } catch (err) {
              /* eslint-disable no-console */
              console.warn('URL API not supported');
              console.warn(err);
              /* eslint-enable no-console */
              return;
            }

            event.preventDefault();
            queryParams = getQueryParams(targetUrl.href);

            // Modify the query params so the server can know which scenario
            // was requested.
            queryParams.scenario = targetScenarioId;
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
