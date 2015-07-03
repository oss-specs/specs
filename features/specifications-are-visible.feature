Feature: Specifications are visible to users
  In order to make specifications more accessible
  As an interested party
  I want specifications to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works.

  # For now this is deliberately feature files rather than features.
  Scenario: A list of feature files can be viewed.
    Given a set of specifications containing at least one feature file
    When an interested party attempts to view them
    Then the list of feature files will be visible

  Scenario: The contents of a feature file can be viewed.
    Given a set of specifications containing at least one feature file
    When an interested party wants to view the scenarios within a feature file
    Then the scenarios will be visible.
