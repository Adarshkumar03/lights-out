const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MovieInstanceSchema = new Schema({
    movie: {type:Schema.Types.ObjectId, ref:"Movie", required:true},
    status:{
        type: String,
        enum: ["Available", "Sold", "ComingSoon"],
        default: "ComingSoon"
    }
});

MovieInstanceSchema.virtual("url").get(function () {
    return `/store/movieinstance/${this._id}`;
});

module.exports = mongoose.model("MovieInstance", MovieInstanceSchema);
