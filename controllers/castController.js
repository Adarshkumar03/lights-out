const { body, validationResult } = require("express-validator");
const async = require("async");
const Movie = require("../models/movie");
const Cast = require("../models/cast");

// Display list of all casts.
exports.cast_list = function (req, res, next) {
  Cast.find()
    .sort([["fullName", "ascending"]])
    .exec(function (err, list_casts) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("cast_list", {
        title: "Cast List",
        cast_list: list_casts,
      });
    });
};

exports.cast_detail = (req, res, next) => {
  async.parallel(
    {
      cast(callback) {
        Cast.findById(req.params.id).exec(callback);
      },
      casts_movies(callback) {
        Movie.find({ casts: {_id: req.params.id} }, "name description imageSrc").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.cast == null) {
        // No results.
        const err = new Error("cast not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("cast_detail", {
        title: "cast Detail",
        cast: results.cast,
        cast_movies: results.casts_movies,
      });
    }
  );
};

exports.cast_create_get = (req,res,next)=>{
  res.render("cast_form", {title: "Create Cast"});
};

exports.cast_create_post = [
  body("fullName")
  .trim()
  .isLength({ min: 1 })
  .withMessage("Full name must be specified.")
  .escape(),
  body("imageSrc")
  .optional({nullable: true}),
  body("bio")
  .optional({nullable:true})
  .escape(),
  body("date_of_birth", "Invalid date of birth")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),
  body("date_of_death", "Invalid date of death")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      res.render("cast_form", {
        title: "Create Cast",
        cast: req.body,
        errors: errors.array()
      });
      return;
    }

    const cast = new Cast({
      fullName: req.body.fullName,
      imageSrc: req.body.imageSrc,
      bio: req.body.bio,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    cast.save((err)=>{
      if(err){
        return next(err);
      }
      res.redirect(cast.url);
    })
  }
]

// Display cast delete form on GET.
exports.cast_delete_get = (req, res, next) => {
  async.parallel(
    {
      cast(callback) {
        Cast.findById(req.params.id).exec(callback);
      },
      casts_movies(callback) {
        Movie.find({ casts: {_id: req.params.id }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.cast == null) {
        // No results.
        res.redirect("/store/casts");
      }
      // Successful, so render.
      res.render("cast_delete", {
        title: "Delete cast",
        cast: results.cast,
        cast_movies: results.casts_movies,
      });
    }
  );
};
  
exports.cast_delete_post = (req, res, next) => {
  async.parallel(
    {
      cast(callback) {
        Cast.findById(req.body.castid).exec(callback);
      },
      casts_movies(callback) {
        Movie.find({ casts: {_id:req.body.castid }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.casts_movies.length > 0) {
        // cast has movies. Render in same way as for GET route.
        res.render("cast_delete", {
          title: "Delete cast",
          cast: results.cast,
          cast_movies: results.casts_movies,
        });
        return;
      }
      // cast has no books. Delete object and redirect to the list of casts.
      Cast.findByIdAndRemove(req.body.castid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to cast list
        res.redirect("/store/casts");
      });
    }
  );
};
  
  // Display cast update form on GET.
  exports.cast_update_get = (req, res, next) => {
    Cast.findById(req.params.id, (err, cast)=>{
      if(err){
        return next(err);
      }
      if(cast==null){
        var error = new Error("Cast not found");
        error.status = 404;
        return next(err);
      }
      res.render("cast_form", {
        title: "Update cast",
        cast
      })
    })
  };
  
  // Handle cast update on POST.
  exports.cast_update_post = [
    body("fullName")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("Full name must be specified"),
    body("imageSrc")
    .optional({nullable: true}),
    body("bio")
    .optional({nullable:true}).escape(),
    body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

    (req, res, next) => {
      const errors = validationResult(req);
      var cast = new Cast({
        fullName: req.body.fullName,
        imageSrc:req.body.imageSrc,
        bio: req.body.bio,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
      });

      if(!errors.isEmpty()){
        res.render("cast_form", {
          title: "Update cast",
          cast,
          errors: errors.array()
        });
        return;
      }else{
        Cast.findByIdAndUpdate(
          req.params.id,
          cast,
          {},
          (err, thecast)=>{
            if(err){
              return next(err);
            }
            res.redirect(thecast.url);
          }
        )
      }
    }
  ]