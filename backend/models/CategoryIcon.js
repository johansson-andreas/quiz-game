import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const categoryIconSchema = new Schema({
  catName: String,             
  iconName: String,    
});

export const CategoryIcon = mongoose.model('CategoryIcon', categoryIconSchema);
