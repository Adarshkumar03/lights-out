const { body, validationResult } = require("express-validator");
const Movie = require("../models/movie");
const async = require("async");
const Genre = require("../models/genre");

// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  Genre.find()
  .sort([["name", "ascending"]])
  .exec(function(err, list_genres){
    if(err){
      return next(err);
    }
    res.render("genre_list", {
      title:"Genre List",
      genre_list: list_genres
    })
  })
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.params.id).exec(callback);
      },
      genre_movies(callback){
        Movie.find({genre:req.params.id}).exec(callback);
      },
    },
    (err, results) => {
      if(err){
        return next(err);
      }
      if(results.genre == null){
        const err = new Error("Genre Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_movies:results.genre_movies
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};


// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name required").trim().isLength({min: 1}).escape(),
  (req,res,next)=>{
    const errors = validationResult(req);
    const genre = new Genre({name: req.body.name});
    if(!errors.isEmpty()){
      res.render("genre_form", {
        title:"Create Genre",
        genre,
        errors:errors.array(),
      });
      return;
    }else {
      Genre.findOne({name:req.body.name}).exec((err, found_genre) => {
        if(err){
          return next(err);
        }

        if(found_genre){
          res.redirect(found_genre.url);
        }else{
          genre.save((err)=>{
            if(err){
              return next(err);
            }
            res.redirect(genre.url);
          })
        }
      })
    }
  }
]

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.params.id).exec(callback);
      },
      genre_movies(callback){
        Movie.find({genre: {_id: req.params.id}}).exec(callback);
      }

    },
    (err, results)=>{
      if(err){
        return next(err);
      }
      if(results.genre==null){
        res.redirect("/store/genre");
      }
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genre_movies: results.genre_movies
      })
    }
  )
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel(
    {
      genre(callback){
        Genre.findById(req.params.id).exec(callback);
      },
      genre_movies(callback){
        Movie.find({genre: {_id: req.params.id}}).exec(callback);
      }
    },
    (err, results)=>{
      if(err){
        return next(err);
      }
      if(results.genre_movies.length > 0){
        res.render("genre_delete", {
          title: "Delete genre",
          genre: results.genre,
          genre_movies: results.genre_movies,
        });
        return;
      }
      Genre.findByIdAndRemove(req.body.genreid, (err)=>{
        if(err){
          return next(err);
        }
        res.redirect("/store/genre")
      })
    }
  )
}

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id, function(err, genre){
    if(err){
      return next(err);
    }
    if(genre==null){
      var error = new Error("Genre not found");
      error.status = 404;
      return next(err);
    }
    res.render("genre_form", {
      title:"Update genre",
      genre
    })
  })
};

// Handle Genre update on POST.
exports.genre_update_post = [
  body("name", "Genre must contain at least 3 characters")
  .trim()
  .isLength({min: 3})
  .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    var genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });
    if(!errors.isEmpty()){
      res.render("genre_form", {
        title: "Update Genre",
        genre,
        errors: errors.array()
      });
      return;
    }else{
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre){
        if(err){
          return next(err);
        }
        res.redirect(thegenre.url);
      })
    }
  }
]
