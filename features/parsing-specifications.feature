Feature: Parsing specifications

	So that I easily identify different parts of specifications
	As a user
	I want to see features broken down into logical parts such as scenarios, features, tables, tags etc

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
		And 2 scenarios with titles
		| Scenario 1 |
		| Scenario 2 |
