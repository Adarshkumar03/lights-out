const { body, validationResult } = require("express-validator");
const async = require("async");
const Movie = require("../models/movie");
const Director = require("../models/director");

// Display list of all Directorss.
exports.director_list = function (req, res, next) {
  Director.find()
    .sort([["fullName", "ascending"]])
    .exec(function (err, list_directors) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("director_list", {
        title: "Director List",
        director_list: list_directors,
      });
    });
};

// Display detail page for a specific director.
exports.director_detail = (req, res, next) => {
  async.parallel(
    {
      director(callback) {
        Director.findById(req.params.id).exec(callback);
      },
      directors_movies(callback) {
        Movie.find({ directors: {_id: req.params.id} }, "name rating imageSrc").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.director == null) {
        // No results.
        const err = new Error("director not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("director_detail", {
        title: "Director Detail",
        director: results.director,
        director_movies: results.directors_movies,
      });
    }
  );
};


exports.director_create_get = (req,res,next)=>{
    res.render("director_form", {title: "Create Director"});
};

exports.director_create_post = [
  body("fullName")
  .trim()
  .isLength({ min: 1 })
  .escape()
  .withMessage("Full name must be specified."),
  body("imageSrc")
  .optional({nullable:true}),
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
      res.render("director_form", {
        title: "Create Director",
        director: req.body,
        errors: errors.array()
      });
      return;
    }

    const director = new Director({
      fullName: req.body.fullName,
      imageSrc: req.body.imageSrc,
      bio: req.body.bio,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    director.save((err)=>{
      if(err){
        return next(err);
      }
      res.redirect(director.url);
    })
  }
]
// Display director delete form on GET.
exports.director_delete_get = (req, res, next) => {
  async.parallel(
    {
      director(callback) {
        Director.findById(req.params.id).exec(callback);
      },
      directors_movies(callback) {
        Movie.find({ directors: {_id: req.params.id }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.director == null) {
        // No results.
        res.redirect("/store/directors");
      }
      // Successful, so render.
      res.render("director_delete", {
        title: "Delete director",
        director: results.director,
        director_movies: results.directors_movies,
      });
    }
  );
};

  
  // Handle director delete on POST.
exports.director_delete_post = (req, res, next) => {
  async.parallel(
    {
      director(callback) {
        Director.findById(req.body.directorid).exec(callback);
      },
      directors_movies(callback) {
        Movie.find({ directors: {_id:req.body.directorid }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.directors_movies.length > 0) {
        // director has books. Render in same way as for GET route.
        res.render("director_delete", {
          title: "Delete director",
          director: results.director,
          director_movies: results.directors_movies,
        });
        return;
      }
      // director has no books. Delete object and redirect to the list of directors.
      Director.findByIdAndRemove(req.body.directorid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to director list
        res.redirect("/store/directors");
      });
    }
  );
};

  
  // Display director update form on GET.
  exports.director_update_get = (req, res) => {
    Director.findById(req.params.id, (err, director)=>{
      if(err){
        return next(err);
      }
      if(director==null){
        var error = new Error("Director not found");
        error.status = 404;
        return next(err);
      }
      res.render("director_form", {
        title: "Update director",
        director
      })
    })
  };
  
  // Handle director update on POST.
  exports.director_update_post = [
    body("fullName")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("Full name must be specified"),
    body("imageSrc")
    .optional({nullable:true}),
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
      var director = new Director({
        fullName: req.body.fullName,
        imageSrc: req.body.imageSrc,
        bio: req.body.bio,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
      });

      if(!errors.isEmpty()){
        res.render("director_form", {
          title: "Update director",
          director,
          errors: errors.array()
        });
        return;
      }else{
        Director.findByIdAndUpdate(
          req.params.id,
          director,
          {},
          (err, thedirector)=>{
            if(err){
              return next(err);
            }
            res.redirect(thedirector.url);
          }
        )
      }
    }
  ]