# Repository integrations

This document will outline how specs is being developed, tested and deployed.

## Development

We folow feature branch development documented at https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow. Each feature has it's own branch, it is reviewed through pull request in https://github.com/oss-specs/specs/pulls and merged after all automatic checks are done.

## Automated checks

As soon as code is checked in automated checks get triggered automatically. This includes unit tests and code quality.

### Continuous integration

Continous integration build is triggered in https://teamcity.sponte.uk/viewType.html?buildTypeId=SpecsExpress_Ci and results are reported back on the pull request page as well as on the homepage at https://github.com/oss-specs/specs. What teamcity does is it checks out relevant commit, runs *npm install* and *npm test* and *npm run test-with-coverage*. The last npm call, will run unit tests while calculating test coverage statistics. At the end results are pushed to https://codeclimate.com/github/oss-specs/specs.

It is also worth mentioning, each pull request gets deployed automatically to heroku using following address: https://oss-specs-specs-eu-pr-<number>.herokuapp.com. For instance for pull request 42 it would be https://oss-specs-specs-eu-pr-42.herokuapp.com. You can find a link to deployed application on the pull request page.

### Dependency management

In order to keep dependencies up to date, we use tool called David. It monitors github for changes and runs dependency checks. You can find detailed report here g/oss-specs/specs.

### Automated deployment - Heroku

When all checks return green status, heroku will deploy the latest to https://oss-specs-specs-eu.herokuapp.com. This is done entirely in heroku. 
