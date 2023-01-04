const { body, validationResult } = require("express-validator");
const Movie = require("../models/movie");
const Director = require("../models/director");
const Writer = require("../models/writer");
const Cast = require("../models/cast");
const Genre = require("../models/genre");
const MovieInstance = require("../models/movieinstance");

const async = require("async");
const { populate } = require("../models/movie");

exports.index = (req, res) => {
  async.parallel(
    {
      movie_count(callback) {
        Movie.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      movie_instance_count(callback) {
        MovieInstance.countDocuments({}, callback);
      },
      movie_instance_available_count(callback) {
        MovieInstance.countDocuments({ status: "Available" }, callback);
      },
      director_count(callback) {
        Director.countDocuments({}, callback);
      },
      writer_count(callback) {
        Writer.countDocuments({}, callback);
      },
      cast_count(callback) {
      Cast.countDocuments({}, callback);
      },
      genre_count(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Lights Out",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Movies.
exports.movie_list = function (req, res, next) {
  Movie.find({}, "name rating")
    .sort({ title: 1 })
    .exec(function (err, list_movies) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("movie_list", { title: "Movie List", movie_list: list_movies });
    });
};

// Display detail page for a specific movie.
exports.movie_detail = (req, res, next) => {
  async.parallel(
    {
      movie(callback){
        Movie.findById(req.params.id)
        .populate("directors")
        .populate("writers")
        .populate("casts")
        .populate("genre")
        .exec(callback);
      },
      movie_instance(callback){
        MovieInstance.find({movie: req.params.id}).exec(callback);
      }
    },
    (err, results)=>{
      if(err){
        return next(err);
      }
      if(results.movie==null){
        const err = new Error("Movie not found");
        err.status = 404;
        return next(err);
      }
      res.render("movie_detail", {
        title: results.movie.name,
        movie: results.movie,
        movie_instances: results.movie_instance
      })
    }
  )
};

// Display movie create form on GET.
exports.movie_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our movie.
  async.parallel(
    {
      casts(callback) {
        Cast.find(callback);
      },
      directors(callback){
        Director.find(callback);
      },
      writers(callback){
        Writer.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("movie_form", {
        title: "Create movie",
        casts: results.casts,
        directors: results.directors,
        writers: results.writers,
        genres: results.genres,
      });
    }
  );
};


// Handle movie create on POST.
exports.movie_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    if (!Array.isArray(req.body.directors)) {
      req.body.directors =
        typeof req.body.directors === "undefined" ? [] : [req.body.directors];
    }
    if (!Array.isArray(req.body.writers)) {
      req.body.writers =
        typeof req.body.writers === "undefined" ? [] : [req.body.writers];
    }
    if (!Array.isArray(req.body.casts)) {
      req.body.casts =
        typeof req.body.casts === "undefined" ? [] : [req.body.casts];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("rating", "Rating must not be empty.").escape(),
  body("imageSrc")
  .optional({nullable:true}),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("date_of_release", "Invalid date of release")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),    
  body("directors.*").escape(),
  body("writers.*").escape(),
  body("casts.*").escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a movie object with escaped and trimmed data.
    const movie = new Movie({
      name: req.body.name,
      rating: req.body.rating,
      imageSrc: req.body.imageSrc,
      date_of_release: req.body.date_of_release,
      directors: req.body.directors,
      writers: req.body.writers,
      casts: req.body.casts,
      description: req.body.description,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          directors(callback) {
            Director.find(callback);
          },
          casts(callback) {
            Cast.find(callback);
          },
          writers(callback) {
            Writer.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (movie.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          for (const director of results.directors) {
            if (movie.directors.includes(director._id)) {
              director.checked = "true";
            }
          }
          for (const writer of results.writers) {
            if (movie.writers.includes(writer._id)) {
              writer.checked = "true";
            }
          }
          for (const cast of results.casts) {
            if (movie.casts.includes(cast._id)) {
              cast.checked = "true";
            }
          }
          res.render("movie_form", {
            title: "Create Movie",
            directors: results.directors,
            writers: results.directors,
            casts: results.directors,
            genres: results.genres,
            movie,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save movie.
    movie.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new movie record.
      res.redirect(movie.url);
    });
  },
];


// Display movie delete form on GET.
exports.movie_delete_get = (req, res, next) => {
  async.parallel(
    {
      movie(callback){
        Movie.findById(req.params.id).exec(callback);
      },
      movie_instance(callback){
        MovieInstance.find({movie: req.params.id}).exec(callback);
      }
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      if(results.movie == null){
        res.redirect("/store/movies");
      }
      res.render("movie_delete", {
        title: "Delete Movie",
        movie: results.movie,
        movie_instances: results.movie_instance
      })
    }
  )
}

// Handle movie delete on POST.
exports.movie_delete_post = (req, res, next) => {
  async.parallel(
    {
      movie(callback){
        Movie.findById(req.params.id).exec(callback);
      },
      movie_instances(callback){
        MovieInstance.find({movie: req.params.id}).exec(callback);
      }
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      if(results.movie_instances.length > 0){
        res.render("movie_delete", {
          title: "Delete Movie",
          movie: results.movie,
          movie_instances: results.movie_instances
        });
        return;
      }
      Movie.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
          return next(err);
        }
        res.redirect("/store/movies")
      })
    }
  )
};

// Display movie update form on GET.
exports.movie_update_get = (req, res, next) => {
  // Get movie, authors and genres for form.
  async.parallel(
    {
      movie(callback) {
        Movie.findById(req.params.id)
          .populate("casts")
          .populate("directors")
          .populate("writers")
          .populate("genre")
          .exec(callback);
      },
      casts(callback) {
        Cast.find(callback);
      },
      directors(callback) {
        Director.find(callback);
      },
      writers(callback) {
        Writer.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.movie == null) {
        // No results.
        const err = new Error("movie not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for(const movieGenre of results.movie.genre){
          if (genre._id.toString() === movieGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }
      for (const director of results.directors) {
        for(const movieDirector of results.movie.directors){
          if (director._id.toString() === movieDirector._id.toString()) {
            director.checked = "true";
          }
        }
      }
      for (const writer of results.writers) {
        for(const movieWriter of results.movie.writers){
          if (writer._id.toString() === movieWriter._id.toString()) {
            writer.checked = "true";
          }
        }
      }
      for (const cast of results.casts) {
        for(const movieCast of results.movie.casts){
          if (cast._id.toString() === movieCast._id.toString()) {
            cast.checked = "true";
          }
        }
      }
      res.render("movie_form", {
        title: "Update movie",
        casts: results.casts,
        directors: results.directors,
        writers: results.writers,
        genres: results.genres,
        movie: results.movie,
      });
    }
  );
};


// Handle movie update on POST.
exports.movie_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    if (!Array.isArray(req.body.directors)) {
      req.body.directors =
        typeof req.body.directors === "undefined" ? [] : [req.body.directors];
    }
    if (!Array.isArray(req.body.writers)) {
      req.body.writers =
        typeof req.body.writers === "undefined" ? [] : [req.body.writers];
    }
    if (!Array.isArray(req.body.casts)) {
      req.body.casts =
        typeof req.body.casts === "undefined" ? [] : [req.body.casts];
    }

    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("rating", "Rating must not be empty.").escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imageSrc").optional({nullable:true}),  
    body("date_of_release", "Invalid date of release")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),    
  body("directors.*").escape(),
  body("writers.*").escape(),
  body("casts.*").escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a movie object with escaped/trimmed data and old id.
    const movie = new Movie({
      name: req.body.name,
      rating: req.body.rating,
      imageSrc: req.body.imageSrc,
      date_of_release: req.body.date_of_release,
      directors: req.body.directors,
      writers: req.body.writers,
      casts: req.body.casts,
      description: req.body.description,
      genre: req.body.genre,
      _id: req.params.id
    });

    

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          casts(callback) {
            Cast.find(callback);
          },
          directors(callback) {
            Director.find(callback);
          },
          writers(callback) {
            Writer.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (movie.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          for (const director of results.directors) {
            if (movie.directors.includes(director._id)) {
              director.checked = "true";
            }
          }
          for (const writer of results.writers) {
            if (movie.writers.includes(writer._id)) {
              writer.checked = "true";
            }
          }
          for (const cast of results.casts) {
            if (movie.casts.includes(cast._id)) {
              cast.checked = "true";
            }
          }
          res.render("movie_form", {
            title: "Update movie",
            directors: results.directors,
            writers: results.writers,
            casts: results.casts,
            genres: results.genres,
            movie,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Movie.findByIdAndUpdate(req.params.id, movie, {}, (err, themovie) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to movie detail page.
      res.redirect(themovie.url);
    });
  },
];

