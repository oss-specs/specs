Feature: Specifications are visible to users
  In order to make specifications more accessible
  As an interested party
  I want specifications to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications without having to understand how version control works.

  Scenario: Specifications are visible in a non-repository location.
    Given a set of specifications exists
    When an interested party attempts to view them
    Then the specifications should be visible
