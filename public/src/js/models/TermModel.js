var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  urlRoot: 'api/terms',
  idAttribute: '_id',

  defaults: {
    name: '',
    full: 0
  },

  initialize: function() {
    this.percentFull();
    this.on('sync', this.percentFull);
  },

  parse: function(obj) {
    if (obj.courses) {
      var CoursesCollection = require('../collections/CoursesCollection');
      obj.courses = new CoursesCollection(obj.courses, { parse: true });
    }

    if (obj.location) {
      var LocationModel = require('./LocationModel');
      obj.location = new LocationModel(obj.location, { parse: true });
    }

    return obj;
  },

  locationAddress: function() {
    return this.get('location').get('name') + '\n' + this.get('location').get('address') + '\n' + this.get('location').get('city') + ', ' + this.get('location').get('state') + '  ' + this.get('location').get('zipcode');
  },

  percentFull: function() {
    if (this.get('courses') && this.get('courses').length) {
      var total = this.get('courses').reduce(function(memo, course) {
        return memo + course.get('seats');
      }, 0);
      var taken = this.get('courses').reduce(function(memo, course) {
        return memo + course.get('registrations').length;
      }, 0);
    }
    var percent = Math.round(taken / total * 100);
    this.set('full', percent);
    if (percent < 90) {
      this.set('health_color', 'red');
    } else if (percent < 95) {
      this.set('health_color', 'yellow');
    } else {
      this.set('health_color', 'green');
    }
  }

});
