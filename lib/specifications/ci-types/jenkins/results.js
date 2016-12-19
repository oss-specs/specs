/**
 * Methods to retrieve the results from a given jenkins server when supplied with URLs to job locations
 */
'use strict';

var rp = require('request-promise');
var appConfig = require('../../../configuration/app-config').get();
var process = require('process');

module.exports = {
  getResults: getResults
};


/**
 * Loops through the array of jenkins URLs to get the job names and then scenario names to be used to display the
 * results on the feature pages.
 */
function getResults(projectData) {
  var j;
  for(j=0;j<projectData.config.jenkinsJobs.length;j++) {
    httpGetJobs(projectData.config.jenkinsJobs[j]);
  }
}

/**
 * Hits a url, calls a call back function and returns an array
 */
function httpGet(theUrl,callback) {
  if(process.env.CI_PORT) {
    theUrl = theUrl.replace(/:\d+/, ':' + process.env.CI_PORT);
  }
  var options = {
    uri: theUrl,
    json:true
  };
  rp(options)
    .then(function(response) {
      callback(response,theUrl);
    });

}

/**
 * Used as a callback function
 * Gets the list of jobs from jenkins and then uses that list to get a list of features
 * @param responseText    the json response from jenkins
 * @param url             the url for the jenkins area we are checking
 */
function getJobs(responseText,url) {
  var jobsList = [];
  var jobsJson = responseText['jobs'];
  var i;
  var j;
  for(i = 0; i < jobsJson.length; i++){
    jobsList.push(jobsJson[i]['name']);
  }
  url = url.replace(/api\/json\?depth=1&tree=jobs\[name]/g,'');
  for(j = 0; j < jobsList.length; j++){
    httpGet(url+'job/'+jobsList[j]+'/lastCompletedBuild/testReport/api/json?pretty=true',getResultsForFeature);
  }
}

/**
 * Used as a call back function
 * Gets the list of results for ran features from jenkins and adds them to a global variable jobNames
 */
function getResultsForFeature(responseText,url) {
  var jobsList = [];
  var jobsJson = responseText['suites'];
  var i = jobsJson.length-1;
  var j;
  for(j = 0; j < jobsJson[i]['cases'].length; j++){
    var jobJson = {};
    var scenario = jobsJson[i]['cases'][j]['className'].replace(/ /g, '%20');
    jobJson.url = url.replace('api/json?pretty=true', 'junit/(root)/' + scenario);
    jobJson.name = jobsJson[i]['cases'][j]['name'];
    jobJson.status = jobsJson[i]['cases'][j]['status'];
    jobsList.push(jobJson);
  }
  appConfig.jobNames.push.apply(appConfig.jobNames,jobsList);
}

function httpGetJobs(url) {
  httpGet(url+'api/json?depth=1&tree=jobs[name]', getJobs);
}