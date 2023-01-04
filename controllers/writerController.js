const { body, validationResult } = require("express-validator");
const async = require("async");
const Movie = require("../models/movie");
const Writer = require("../models/writer");

// Display list of all writers.
exports.writer_list = function (req, res, next) {
  Writer.find()
    .sort([["fullName", "ascending"]])
    .exec(function (err, list_writers) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("writer_list", {
        title: "Writer List",
        writer_list: list_writers,
      });
    });
};

// Display detail page for a specific writer.
exports.writer_detail = (req, res, next) => {
  async.parallel(
    {
      writer(callback) {
        Writer.findById(req.params.id).exec(callback);
      },
      writers_movies(callback) {
        Movie.find({ writers: {_id: req.params.id} }, "name rating imageSrc").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.writer == null) {
        // No results.
        const err = new Error("writer not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("writer_detail", {
        title: "Writer Detail",
        writer: results.writer,
        writer_movies: results.writers_movies,
      });
    }
  );
};

exports.writer_create_get = (req,res,next)=>{
  res.render("writer_form", {title: "Create Writer"});
};

exports.writer_create_post = [
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
      res.render("writer_form", {
        title: "Create writer",
        writer: req.body,
        errors: errors.array()
      });
      return;
    }

    const writer = new Writer({
      fullName: req.body.fullName,
      imageSrc: req.body.imageSrc,
      bio: req.body.bio,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });
    writer.save((err)=>{
      if(err){
        return next(err);
      }
      res.redirect(writer.url);
    })
  }
]

// Display writer delete form on GET.
exports.writer_delete_get = (req, res, next) => {
  async.parallel(
    {
      writer(callback) {
        Writer.findById(req.params.id).exec(callback);
      },
      writers_movies(callback) {
        Movie.find({ writers: {_id: req.params.id }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.writer == null) {
        // No results.
        res.redirect("/store/writers");
      }
      // Successful, so render.
      res.render("writer_delete", {
        title: "Delete writer",
        writer: results.writer,
        writer_movies: results.writers_movies,
      });
    }
  );
};
  
  // Handle writer delete on POST.
exports.writer_delete_post = (req, res, next) => {
  async.parallel(
    {
      writer(callback) {
        Writer.findById(req.body.writerid).exec(callback);
      },
      writers_movies(callback) {
        Movie.find({ writers: {_id:req.body.writerid }}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.writers_movies.length > 0) {
        // writer has books. Render in same way as for GET route.
        res.render("writer_delete", {
          title: "Delete writer",
          writer: results.writer,
          writer_movies: results.writers_movies,
        });
        return;
      }
      // writer has no books. Delete object and redirect to the list of writers.
      Writer.findByIdAndRemove(req.body.writerid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to writer list
        res.redirect("/store/writers");
      });
    }
  );
};
  
  // Display writer update form on GET.
  exports.writer_update_get = (req, res) => {
    Writer.findById(req.params.id, (err, writer)=>{
      if(err){
        return next(err);
      }
      if(writer==null){
        var error = new Error("Writer not found");
        error.status = 404;
        return next(err);
      }
      res.render("writer_form", {
        title: "Update writer",
        writer
      })
    })
  };
  
  // Handle writer update on POST.
  exports.writer_update_post = [
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
      var writer = new Writer({
        fullName: req.body.fullName,
        imageSrc: req.body.imageSrc,
        bio: req.body.bio,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
        _id: req.params.id
      });

      if(!errors.isEmpty()){
        res.render("writer_form", {
          title: "Update writer",
          writer,
          errors: errors.array()
        });
        return;
      }else{
        Writer.findByIdAndUpdate(
          req.params.id,
          writer,
          {},
          (err, thewriter)=>{
            if(err){
              return next(err);
            }
            res.redirect(thewriter.url);
          }
        )
      }
    }
  ]