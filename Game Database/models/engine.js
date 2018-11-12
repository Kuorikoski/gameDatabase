var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EngineSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this engine instance URL.
EngineSchema
.virtual('url')
.get(function () {
  return '/catalog/engine/'+this._id;
});

// Export model.
module.exports = mongoose.model('Engine', EngineSchema);