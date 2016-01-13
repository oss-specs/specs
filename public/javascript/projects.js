/* eslint-env browser */
/* global $ */

(function() {
  'use strict';

  // Delete project button functionality.
  $(function() {
    var buttonEls$ = $('.projects-list .delete-project');

    buttonEls$.click(function() {
      var projectName = this.dataset.projectName;
      
      var confirm = window.confirm('Do you really want to delete project ' + projectName + '? This cannot be undone!')
      if(!confirm) return;

      var loc = window.location;
      var baseUrl = loc.origin + loc.pathname;

      this.classList.add('waiting');

      $.ajax({
        url: baseUrl + '?project_name=' + projectName,
        method: 'DELETE'
      }).done(function() {
        window.location = baseUrl;
      });
    });

  });
})();
