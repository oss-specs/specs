@ui-automation @ci-mock
Feature: Continuous integration results can be retrieved from remote CI server.
  In order for specifications to be considered a "living documentation" system
  As someone interested in the results for a project from a ci server
  I want those results to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works. The '@cleanSlate' tag means these tests make sure there are no existing features stored. The '@ui-automation' tag means that these tests use WebDriver.

  @cleanSlate
  Scenario: Results can be retrieved if project has CI links
    Given a user is viewing oss-specs repository
    When an interested party wants to view the results for the features in that repo
    Then the get results button is displayed.

  @cleanSlate
  Scenario: Results can be retrieved if project has CI Links
    Given a user is viewing oss-specs repository
    When an interested party wants to view the results for the features in that repo
    And the results are retrieved from a CI server
    Then the list of results for the feature will be visible.
