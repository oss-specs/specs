Feature: Specifications are visible to users
  In order to make specifications more accessible
  As an interested party
  I want specifications to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works. The 'internet' and 'server' tags mean that test requires access to the internet or the server to be running respectively.

  @server
  Scenario: A list of features is available.
    Given a set of specifications containing at least one feature file
    When an interested party attempts to view them
    Then the list of features will be visible.

  @server
  Scenario: It is simple to see the scenarios within with a feature file.
    Given a list of feature files is displayed
    When an interested party wants to view the scenarios within that feature file
    Then the scenarios will be visible.

  @internet @server
  Scenario: Features can be retrieved from a remote Git repo.
    Given a URL representing a remote Git repo
    When an interested party wants to view the features in that repo
    Then the list of features will be visible.

    @internet @server
    Scenario: Requesting features for an existing project displays features.
      Given a URL representing a remote Git repo
      When an interested party wants to view the features in that repo
      And they request the features for the same repository again
      Then the list of features will be visible.
