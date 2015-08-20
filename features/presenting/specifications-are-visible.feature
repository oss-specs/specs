Feature: Specifications are visible to users
  In order to make specifications more accessible
  As an interested party
  I want specifications to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works. The 'server' tag means that test requires the server to be running.

  Background:
    Given a set of specifications containing at least one feature file

  @server @presenting
  Scenario: A list of features is available.
    When an interested party attempts to view them
    Then the list of features will be visible.

  @server @presenting
  Scenario: It is simple to see the scenarios within with a feature file.
    Given a list of feature files is displayed
    When an interested party wants to view the scenarios within that feature file
    Then the scenarios will be visible.
