@ui-automation
Feature: Continuous integration results can be retrieved from remote CI server.
  In order for specifications to be considered a "living documentation" system
  As someone interested in the results for a project from a ci server
  I want those results to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works. The '@cleanSlate' tag means these tests make sure there are no existing features stored. The '@ui-automation' tag means that these tests use WebDriver.

  @cleanSlate
  Scenario: Features can be retrieved from a remote Git repo.
    Given the test results are retrieved from ci server
    When an interested party wants to view the results for a feature from the ci server
    Then the list of results for the feature will be visible.

