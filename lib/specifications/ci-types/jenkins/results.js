/**
 * Methods to retrieve the results from a given jenkins server when supplied with URLs to job locations
 */
'use strict';

var rp = require('request-promise');
var appConfig = require('../../../configuration/app-config').get();
var _ = require('underscore');

module.exports = {
    getCiResults: getResults
};


/**
 * Loops through the array of jenkins URLs to get the job names and then scenario names to be used to display the
 * results on the feature pages.
 */
function getResults(projectData) {
    var promises = [];

    projectData.config.ciJobs.jenkins.forEach(function (view) {
        promises.push(
            httpGetJobs(view)
            .then(parseJobs)
        );
    });

    return Promise.all(promises)
        .then(function (results) {
            var flatMap = _.flatten(results);
            console.log(">>>>>>>>>>>>>>>>>>", flatMap.length, flatMap);
            flatMap.forEach(function (result) {
                appConfig.jobNames.push(result);
            });
        })
}

/**
 * Hits a url, calls a call back function and returns an array
 */
function get(theUrl, params) {
    var options = {
        uri: theUrl + "/api/json?" + params,
        json: true
    };
    return rp(options);
}

/**
 * Used as a callback function
 * Gets the list of jobs from jenkins and then uses that list to get a list of features
 * @param response    the json response from jenkins
 * @param url             the url for the jenkins area we are checking
 */
function parseJobs(response) {
    var testResultPromises = [];

    response.jobs.forEach(function (job) {
        var latestJobUrl = job.url + 'lastCompletedBuild';
        var jobDetails;
        testResultPromises.push(
            get(latestJobUrl)
                .then(function (job) {
                    jobDetails = job;
                    return get(job.url + "testReport");
                })
                .then(function (testResults) {
                    return getResultsForFeature(testResults, jobDetails)
                })
                .catch(function (err) {
                })
        );
    });

    return Promise.all(testResultPromises);
}

/**
 * Used as a call back function
 * Gets the list of results for ran features from jenkins and adds them to a global variable jobNames
 */
function getResultsForFeature(response, jobDetails) {
    var jobsList = [];
    var suites = response.suites;

    suites.forEach(function (suite) {
        suite.cases.forEach(function (testCase) {
            var jobJson = {};
            var scenario = testCase.className.replace(/ /g, '%20');
            jobJson.name = testCase.name;
            jobJson.status = testCase.status;
            jobJson.job = {
                name: jobDetails.fullDisplayName
            };
            jobJson.url = jobDetails.url + 'testReport/junit/(root)/' + scenario;
            jobsList.push(jobJson);
        })
    });


    return jobsList;

    // appConfig.jobNames.push.apply(appConfig.jobNames, jobsList);
}

function httpGetJobs(url) {
    return get(url, "depth=1&tree=jobs[name,url]");
}