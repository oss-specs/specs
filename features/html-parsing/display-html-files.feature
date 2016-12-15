@ui-automation
Feature: Display HTML files as part of the project

@cleanSlate
Scenario: Users can view HTML file from the repository
  Given a URL representing a remote Git repo "https://github.com/oss-specs/specs"
  When an interested party wants to view the features in that repo
  And they decide to change which branch is being displayed
  And they decide to view HTML specification
  Then HTML specification is displayed

