Feature: Parsing specifications

  So that I can easily identify different parts of specifications
  As a user
  I want to see features broken down into logical parts such as scenarios, features, tables, tags etc

  # Slightly confusing because this is a feature about features.
  Background: A feature file exists
    Given the feature file
      """
      # An example background in text block in a background.
      Background: Backgrounds exist
        Given there is a background

      # A feature comment.
      @myFeatureLevelTag1 @myFeatureLevelTag2
      Feature: Feature title

        Some descriptive text, sometimes a "user story"

        # A scenario comment.
        @myScenarioLevelTag1 @myScenarioLevelTag2
        Scenario: Scenario 1
          Given something is true
          And something else is true
          But a third thing is not true
          When an action happens
          Then there is an outcome

        Scenario: Scenario 2
          Given I have an "argument"
          When I have a table data:
            | name | stuff |
            | asdf | ASDDS |
          Then I expect
            \"\"\"
              A block of text
              On mulptiple lines.
            \"\"\"

        Scenario Outline: a collection of related examples
          Given I have a <placeholder>
          When I compare it to <another placeholder>
          Then the expected outcome is <a third lovely placeholder>

          Examples:
            | placeholder | another placeholder | a third lovely placeholder |
            | value1-1    | value1-2            | value1-3                   |
            | value2-1    | value2-2            | value2-3                   |

      Feature: coping with multiple features in a file.
      """

  @parsing @dev
  Scenario: Parse titles
    When I parse this specification
    Then I get a feature with title "Feature title"
    And a background with the title "Backgrounds exist"
    And scenarios with titles
    | Scenario 1 |
    | Scenario 2 |

  @parsing
  Scenario: Parse tags
    When I parse this specification
    Then feature tags are associated with features
      | @myFeatureLevelTag1 |
      | @myFeatureLevelTag2 |
    And scenario tags are associated with scenarios
      | @myScenarioLevelTag1 |
      | @myScenarioLevelTag2 |

  @parsing
  Scenario: Parse comments
    When I parse this specification
    Then feature comments are associated with features
      | # A feature comment. |
    And scenario comments are associated with scenarios
      | # A scenario comment. |
