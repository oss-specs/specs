# This is an example feature file to test the feature file parser against.

# Script injection attacks shouldn't work </div><script>alert('borked')</script>
# A feature comment.
@myFeatureLevelTag1 @myFeatureLevelTag2
Feature: Feature title

  Some descriptive text, sometimes a "user story"

  # An example background in text block in a background.
  Background: Backgrounds exist
    Given there is a background

  # A scenario comment.
  @myScenarioLevelTag1 @myScenarioLevelTag2
  Scenario: Scenario 1
  Some scenarios have descriptions as well.
    Given something is true
    And something else is true
    But a third thing is not true
    When an action happens
    Then there is an outcome

  Scenario: Scenario 2
    Given I have an "argument"
    When I have a table data:
      | column name 1 | column name 2       |
      | a table value | another table value |
    Then I expect
      """ the-type-of-content
      A block of text
      On mulptiple lines.
      """

  Scenario Outline: A collection of related examples
    Given I have a <placeholder>
    When I compare it to <another placeholder>
    Then the expected outcome is <a third lovely placeholder>

    @myExampleLevelTag1 @myExampleLevelTag2
    Examples: Examples with a title
      some description of the examples
      | placeholder | another placeholder | a third lovely placeholder |
      | value1-1    | value1-2            | value1-3                   |
      | value2-1    | value2-2            | value2-3                   |
      | value3-1    | value3-2            | value3-3                   |

Feature: coping with multiple features in a file.
  Scenario: Complex doc strings
    Given a complex doc string
      """
      A doc string
        with leading spaces
          that should be preserved
            cows.
      and <content that contains chevrons>
      and then some more content.
      """
