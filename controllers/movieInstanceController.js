const { body, validationResult } = require("express-validator");
const async = require("async");
const movie = require("../models/movie");
const MovieInstance = require("../models/movieinstance");

// Display list of all movieInstances.
exports.movieinstance_list = (req, res, next) => {
  MovieInstance.find()
  .populate("movie")
  .exec(function(err, list_movieinstances){
    if(err){
      return next(err);
    }
    res.render("movieinstance_list", {
      title:"Movie Instance List",
      movieinstance_list: list_movieinstances
    });     

  });
};

// Display detail page for a specific movieInstance.
exports.movieinstance_detail = (req, res, next) => {
  MovieInstance.findById(req.params.id)
    .populate("movie")
    .exec((err, movieinstance) => {
      if (err) {
        return next(err);
      }
      if (movieinstance == null) {
        // No results.
        const err = new Error("movie copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("movieinstance_detail", {
        title: `Copy: ${movieinstance.movie.name}`,
        movieinstance,
      });
    });
};

// Display movieInstance create form on GET.
exports.movieinstance_create_get = (req, res, next) => {
  movie.find({}, "name").exec((err, movies) => {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("movieinstance_form", {
      title: "Create MovieInstance",
      movie_list: movies,
    });
  });
};


// Handle movieInstance create on POST.
exports.movieinstance_create_post = [
  // Validate and sanitize fields.
  body("movie", "Movie must be specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a movieInstance object with escaped and trimmed data.
    const movieinstance = new MovieInstance({
      movie: req.body.movie,
      status: req.body.status,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      movie.find({}, "name").exec(function (err, movies) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("movieinstance_form", {
          title: "Create movieInstance",
          movie_list: movies,
          selected_movie: movieinstance.movie._id,
          errors: errors.array(),
          movieinstance,
        });
      });
      return;
    }

    // Data from form is valid.
    movieinstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new record.
      res.redirect(movieinstance.url);
    });
  },
];


// Display movieInstance delete form on GET.
exports.movieinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      movie_instance(callback){
        MovieInstance.findById(req.params.id).exec(callback);
      }
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      if(results.movie_instance==null){
        res.redirect("/store/movieinstances")
      }
      res.render("movieinstance_delete", {
        title: `Movie Instance Delete`,
        movieinstance: results.movie_instance,
      })
    }
  )
};

// Handle movieInstance delete on POST.
exports.movieinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      movie_instance(callback){
        MovieInstance.findById(req.params.id).exec(callback);
      }
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      MovieInstance.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
          return next(err);
        }
        res.redirect("/store/movieinstances");
      })
    }
  )
};

// Display movieInstance update form on GET.
exports.movieinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      movieinstance(callback){
        MovieInstance.findById(req.params.id).populate("movie").exec(callback);
      },
      movies(callback){
        movie.find(callback);
      }
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      if(results.movieinstance==null){
        var error = new Error("Movie copy not found");
        error.status = 404
        return next(err);
      }
      res.render("movieinstance_form", {
        title: "Update Movie Instance",
        movie_list: results.movies,
        selected_movie: results.movieinstance.movie._id,
        movieinstance: results.movieinstance
      })
    }
  )
};

// Handle movieinstance update on POST.
exports.movieinstance_update_post = [
  body("movie", "Movie must be specified")
  .trim()
  .isLength({min: 1})
  .escape(),
  body("status")
  .escape(),

  (req, res, next) => {
    var errors = validationResult(req);

    var movieinstance = new MovieInstance({
      movie: req.body.movie,
      status: req.body.status,
      _id: req.params.id
    });

    if(!errors.isEmpty()){
      movie.find({}, "name").exec((err, movies)=>{
        if(err){
          return next(err);
        }
        res.render("movieinstance_form", {
          title: "Update Movie Instance",
          movie_list: movies,
          selected_movie: movieinstance.movie._id,
          errors: errors.array(),
          movieinstance
        });
      });
      return;
    }else{
      MovieInstance.findByIdAndUpdate(
        req.params.id, 
        movieinstance, 
        {},
        (err, themovieinstance)=>{
          if(err){
            return next(err);
          }
          res.redirect(themovieinstance.url);
        })
    }
  }
]
