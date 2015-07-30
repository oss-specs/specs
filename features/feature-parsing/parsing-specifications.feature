Feature: Parsing specifications

	So that I easily identify different parts of specifications
	As a user
	I want to see features broken down into logical parts such as scenarios, features, tables, tags etc

	# Slightly confusing because this is a feature about features.
	Background: A feature file exists
		Given the feature file
			"""
			@myFeatureLevelTag
			Feature: Feature title

				Some descriptive text, sometimes a "user story"

				# A comment
				@myScenarioLevelTag
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

	@parsing
	Scenario: Parse titles
		When I parse this specification
		Then I get a feature with title "Feature title"
		And scenarios with titles
		| Scenario 1 |
		| Scenario 2 |
