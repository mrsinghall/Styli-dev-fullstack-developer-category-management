const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true},
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  filters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Filter' }]
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);
