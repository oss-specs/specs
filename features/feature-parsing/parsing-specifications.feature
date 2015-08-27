Feature: Parsing specifications

  So that I can easily identify different parts of specifications
  As a user
  I want to see features broken down into logical parts such as scenarios, features, tables, tags etc

  General notes:
  Features are the top level entity.
  Backgrounds, Scenarios and Scenario Outlines belong to Features.
  Steps can belong to Backgrounds, Scenarios and Scenario Outlines.
  Rows can belong to Steps (data table) or Examples.
  Examples belong to Scenario Outlines.
  Doc Strings belong to Steps.
  Tags can belong to Features, Scenarios and Examples.
  Comments can belong to Features and Scenrios.


  # Slightly confusing because this is a feature about features.
  Background: A feature file exists
    Given an example feature file

  @parsing
  Scenario: Parse titles
    When I parse this specification
    Then I get a feature with title "Feature title"
    And I get a background with the title "Backgrounds exist"
    And I get scenarios with titles
      | Scenario 1 |
      | Scenario 2 |
    And I get a scenario outline with the title "A collection of related examples"
    And I get a set of examples with the title "Examples with a title"

  @parsing
  Scenario: Parse tags
    When I parse this specification
    Then feature tags are associated with features
      | @myFeatureLevelTag1 |
      | @myFeatureLevelTag2 |
    And scenario tags are associated with scenarios
      | @myScenarioLevelTag1 |
      | @myScenarioLevelTag2 |
    And example tags are associated with examples
      | @myExampleLevelTag1 |
      | @myExampleLevelTag2 |

  @parsing
  Scenario: Parse comments
    When I parse this specification
    Then feature comments are associated with features
      | # A feature comment. |
    And scenario comments are associated with scenarios
      | # A scenario comment. |

  @parsing
  Scenario: Parse steps
    When I parse this specification
    Then the "first" scenario has steps with the names
      | something is true   |
      | there is an outcome |
    And the "second" scenario has steps with the names
      | I have an "argument" |
      | I expect             |

    @parsing
    Scenario: Parse example data
      When I parse this specification
      Then scenario outlines have example data
        | value1-1 |
        | value2-3 |

    @parsing
    Scenario: Parse table data
      When I parse this specification
      Then steps with tables have that table data
        | a table value       |
        | another table value |

    @parsing
    Scenario: Parse doc strings
      When I parse this specification
      Then steps with doc strings have that doc string content
        | A block of text\nOn mulptiple lines. |
