var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlatformSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this platform instance URL.
PlatformSchema
.virtual('url')
.get(function () {
  return '/catalog/platform/'+this._id;
});

// Export model.
module.exports = mongoose.model('Platform', PlatformSchema);