import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    username: String,
    password: String,
    categoryStats: {
        type: Map,
        of: {
            type: [Number],  // Each value is an array of numbers
            validate: {
                validator: function (v) {
                    return v.length === 2;
                },
                message: props => `${props.value} does not have exactly 2 elements!`
            }
        },
        default: {}
    }
});

AccountSchema.plugin(passportLocalMongoose);

export const Account = mongoose.model('Account', AccountSchema);