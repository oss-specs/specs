Feature: Specifications can be retrieved from remote Git repositories.
  In order to make specifications more accessible
  As someone interested in the specification for a project stored on a remote Git server
  I want those specifications to be visible in a nice web UI.

  The general idea is that anyone should be able to see the specifications stored in a project without having to understand how version control works. The '@internet' and '@server' tags mean that tests requires access to the internet or the server to be running respectively. The '@cleanSlate' tag means these tests expect there to be no existing features stored.

  @internet @server @retrieving @cleanSlate
  Scenario: Features can be retrieved from a remote Git repo.
    Given a URL representing a remote Git repo "https://github.com/oss-specs/specs"
    When an interested party wants to view the features in that repo
    Then the list of features will be visible.

  @internet @server @retrieving @cleanSlate
  Scenario: Requesting features for an existing project displays features.
    Given a URL representing a remote Git repo "https://github.com/oss-specs/specs"
    When an interested party wants to view the features in that repo
    And they request the features for the same repository again
    Then the list of features will be visible.
