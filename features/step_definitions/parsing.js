module.exports = function() {
this.Given(/^following feature file$/, function (string, callback) {
  // Write code here that turns the phrase above into concrete actions
  callback.pending();
});

this.When(/^I parse this specification$/, function (callback) {
  // Write code here that turns the phrase above into concrete actions
  callback.pending();
});

this.Then(/^I get a feature with title "([^"]*)"$/, function (arg1, callback) {
  // Write code here that turns the phrase above into concrete actions
  callback.pending();
});

this.Then(/^scenarios with titles$/, function (table, callback) {
  // Write code here that turns the phrase above into concrete actions
  callback.pending();
});
}
