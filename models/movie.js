const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    name: {type: String, required:true},
    imageSrc:{type: String},
    rating:{type:Number, required: true},
    description:{type:String},
    date_of_release:{type:Date, required:true},
    genre:[{type:Schema.Types.ObjectId, ref:"Genre"}],
    directors:[{type:Schema.Types.ObjectId, ref:"Director"}],
    writers:[{type:Schema.Types.ObjectId, ref:"Writer"}],
    casts:[{type:Schema.Types.ObjectId, ref:"Cast"}]
});

MovieSchema.virtual("url").get(function(){
    return `/store/movie/${this._id}`;
});

module.exports = mongoose.model("Movie", MovieSchema);