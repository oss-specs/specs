@ui-automation
Feature: Display HTML files as part of the project

@cleanSlate
Scenario: Users can view HTML file from the repository
  Given a user is viewing oss-specs repository
  And they decide to view HTML specification
  Then HTML specification is displayed

