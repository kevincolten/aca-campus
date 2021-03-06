var _ = require('underscore');
var React = require('react');
require('react.backbone');
var RegistrationItemComponent = React.createFactory(require('./RegistrationItemComponent'));
var tableToCsv = require('node-table-to-csv');

module.exports = React.createBackboneClass({
  componentDidMount: function() {
    $('select').material_select();
  },

  componentDidUpdate: function() {
    $('select').material_select('update');
  },

  registerUser: function(e) {
    e.preventDefault();
    var that = this;
    if (this.refs.course.value) {
      var course = this.getCollection().get(this.refs.course.value);
      course.get('registrations').push(this.props.users.get(this.refs.user.value));
      course.save(null, {
        success: function() {
          that.getCollection().trigger('add');
          Materialize.toast('Student Registered!', 4000)
        }
      });

    }
  },

  exportCSV: function() {
    var csv = tableToCsv('<table>' + this.refs.registrations.innerHTML + '</table>');
    var uri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
    var downloadLink = document.createElement("a");
    downloadLink.href = uri;
    downloadLink.download = "registrations.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  },

  render: function() {
    var registrations = [];

    this.getCollection().each(function(course) {
      course.get('registrations').each(function(user) {
        if (this.props.currentUser.get('is_admin') || user.id === this.props.currentUser.id) {
          registrations.push({ course: course, user: user });
        }
      }, this);
    }, this);

    var registrationItems = _.map(registrations, function(registration) {
      return <RegistrationItemComponent user={registration.user} course={registration.course} collection={this.getCollection()} key={registration.user.id + registration.course.id} />
    }, this);

    var courseOptions = [];
    this.getCollection().each(function(course) {
      courseOptions.push(<option key={course.id} value={course.id}>{course.get('term').get('name') + ' - ' + course.get('name')}</option>);
    });

    var userOptions = [];
    this.props.users.each(function(user) {
      userOptions.push(<option key={user.id} value={user.id}>{user.fullName() + ' (' + user.get('username') + ')'}</option>);
    });

    return (
      <div>
        <br/>
        <form className="col s12" onSubmit={this.registerUser}>
          <div className="row">
            <div className="input-field col m6 s12">
              <select defaultValue={this.props.users.first().id} ref="user">
                {userOptions}
              </select>
              <label>User</label>
            </div>
            <div className="input-field col m6 s12">
              <select ref="course" defaultValue="">
                <option value="" disabled>Select a Course</option>
                {courseOptions}
              </select>
              <label>Course</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12 m6">
              <button className="btn waves-effect waves-light" type="submit" name="action">Register
                <i className="material-icons right">send</i>
              </button>
            </div>
            <div className="input-field col s12 m6">
              <button onClick={this.exportCSV} className="btn waves-effect waves-light">Export to CSV <i className="material-icons right">file_download</i></button>
            </div>
          </div>
        </form>
        <div className="row">
          <div className="col s12">
            <table ref="registrations">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Term</th>
                  <th>Course</th>
                </tr>
              </thead>
              <tbody>
                {registrationItems}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});
