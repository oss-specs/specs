/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  function getQueryParams() {
    var vars = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars[hash[0]] = hash[1];
    }
    return vars;
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
      repoControlsEl.classList.toggle('collapse');
      openBurgerMenu = !repoControlsEl.classList.contains('collapse');

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

    // On change, reload the page with a new query param dictating target branch.
    selectEl.on('change', function() {
      var tag = this.value;
      var queryParams = getQueryParams();
      var searchUrlFragment;
      var featureByTagUrl;

      queryParams['tags'] = tag;
      searchUrlFragment = Object.keys(queryParams).reduce(function(soFar, key, index, keys) {
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
      featureByTagUrl = window.location.pathname + searchUrlFragment;
      window.location.href = featureByTagUrl;
    });
  });
})();
