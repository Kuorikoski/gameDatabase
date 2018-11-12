var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var GameSchema = new Schema(
  {
    title: {type: String, required: true},
    developer: {type: Schema.Types.ObjectId, ref: 'Developer', required: true},
    summary: {type: String, required: true},
    //isbn: {type: String, required: true},
	platform: [{type: Schema.Types.ObjectId, ref: 'Platform'}],
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
    engine: [{type: Schema.Types.ObjectId, ref: 'Engine'}],
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
	
  }
);

// Virtual for game's URL
GameSchema
.virtual('url')
.get(function () {
  return '/catalog/game/' + this._id;
});

// Virtual for game's lifespan
GameSchema
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

GameSchema
.virtual('date_of_birth_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

GameSchema
.virtual('date_of_death_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_death).format('YYYY-MM-DD');
});

//Export model
module.exports = mongoose.model('Game', GameSchema);