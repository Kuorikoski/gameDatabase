var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var DeveloperSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
	location_name: {type: String, required: true, max: 100},
   // family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for developer's full name
DeveloperSchema
.virtual('name')
.get(function () {
  return this.first_name;
});

// Virtual for developer's location name
DeveloperSchema
.virtual('location')
.get(function () {
  return this.location_name;
});

// Virtual for developer's lifespan
DeveloperSchema
.virtual('lifespan')
.get(function () {
  var lifetime_string='';
  if (this.date_of_birth) {
      lifetime_string=moment(this.date_of_birth).format('MMMM Do, YYYY');
      }
  lifetime_string+=' - ';
  if (this.date_of_death) {
      lifetime_string+=moment(this.date_of_death).format('MMMM Do, YYYY');
      }
  return lifetime_string
});

DeveloperSchema
.virtual('date_of_birth_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

DeveloperSchema
.virtual('date_of_death_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_death).format('YYYY-MM-DD');
});

// Virtual for developer's URL
DeveloperSchema
.virtual('url')
.get(function () {
  return '/catalog/developer/' + this._id;
});

//Export model
module.exports = mongoose.model('Developer', DeveloperSchema);