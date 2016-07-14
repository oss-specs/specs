/**
 *
 */
'use strict';

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var appConfig = require('../../../configuration/app-config').get();

module.exports = {
  getResults: getResults
};


/**
 * Get or update the project repo using Git.
 *
 * @return a promise for the repo metadata.
 */
function getResults(projectData) {
  for(var j=0;j<projectData.config.jenkinsJobs.length;j++) {
    httpGetJobs(projectData.config.jenkinsJobs[j]);
  }
}

/**
 * Hits a url, calls a call back function and returns an array
 */
function httpGet(theUrl, callBack, async) {
  var xmlHttp = new XMLHttpRequest();
  var resultsList = [];
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      resultsList=callBack(xmlHttp.responseText, theUrl);
    }
  };
  xmlHttp.open('GET', theUrl, async);
  xmlHttp.send(null);
  return resultsList;
}

/**
 * Used as a callback function
 * Gets the list of jobs from jenkins and then uses that list to get a list of features
 * @param responseText    the json response from jenkins
 * @param url             the url for the jenkins area we are checking
 */
function ParseJsonJobs(responseText,url) {
  var jobsList = [];
  var jsonText = JSON.parse(responseText);
  var jobsJson = jsonText['jobs'];
  for(var i = 0; i < jobsJson.length; i++){
    jobsList.push(jobsJson[i]['name']);
  }
  url = url.replace(/api\/json\?depth=1&tree=jobs\[name]/g,'');
  for(var j = 0; j < jobsList.length; j++){
    httpGet(url+'job/'+jobsList[j]+'/lastCompletedBuild/testReport/api/json?pretty=true',ParseJsonIndividualJobs,true);
  }
}

/**
 * Used as a call back function
 * Gets the list of ran features from jenkins and adds them to a global variable jobNames
 */
function ParseJsonIndividualJobs(responseText,url) {
  var jobsList = [];
  var jsonText = JSON.parse(responseText);
  var jobsJson = jsonText['suites'];
  var i = jobsJson.length-1;
  for(var j = 0; j < jobsJson[i]['cases'].length; j++){
    var jobJson = {};
    var scen = jobsJson[i]['cases'][j]['className'].replace(/ /g, '%20');
    jobJson.url = url.replace('api/json?pretty=true', 'junit/(root)/' + scen);
    jobJson.name = jobsJson[i]['cases'][j]['name'];
    jobJson.status = jobsJson[i]['cases'][j]['status'];
    jobsList.push(jobJson);
  }
  appConfig.jobNames.push.apply(appConfig.jobNames,jobsList);
}

function httpGetJobs(url) {
  //Using async right now as is quicker and seems to be working, change to false if want results to come in same order each time
  httpGet(url+'api/json?depth=1&tree=jobs[name]', ParseJsonJobs,true);
}