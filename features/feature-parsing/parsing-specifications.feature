Feature: Parsing specifications

	So that I easily identify different parts of specifications
	As a user
	I want to see features broken down into logical parts such as scenarios, features, tables, tags etc

	@parsing
	Scenario: Parse specification
		Given following feature file
			"""
			Feature: Feature title

				Narrative

			Scenario: Scenario 1

			Scenario: Scenario 2
			"""
		When I parse this specification
		Then I get a feature with title "Feature title"
		And scenarios with titles
		| Scenario 1 |
		| Scenario 2 |
