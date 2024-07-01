const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryIconSchema = new Schema({
  catName: String,             
  iconName: String,    
});

const CategoryIcon = mongoose.model('CategoryIcon', categoryIconSchema);

module.exports = CategoryIcon;