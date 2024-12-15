const mongoose = require('mongoose');

const FilterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true},
  options: [{ type: String }],
  imageUrl: {type: String, required: true},
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' }
});

module.exports = mongoose.model('Filter', FilterSchema);
