const mongoose = require("mongoose");
const {DateTime} = require("luxon");

const Schema = mongoose.Schema;

const CastSchema = new Schema({
    fullName: {type: String, required: true, maxLength: 100},
    bio:{type:String,},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
    imageSrc: {type: String}
})

CastSchema.virtual("lifespan").get(function(){
    date_of_birth = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
    date_of_death = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
    return `${date_of_birth} - ${date_of_death}`;
  })

CastSchema.virtual("url").get(function(){
    return `/store/cast/${this._id}`;
})

module.exports = mongoose.model("Cast", CastSchema);