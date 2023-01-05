const express = require("express");
const router = express.Router();

// Require controller modules.
const movie_controller = require("../controllers/movieController");
const director_controller = require("../controllers/directorController");
const writer_controller = require("../controllers/writerController");
const cast_controller = require("../controllers/castController");
const genre_controller = require("../controllers/genreController");
const movie_instance_controller = require("../controllers/movieInstanceController");

/// movie ROUTES ///

// GET catalog home page.
router.get("/", movie_controller.index);

// GET request for creating a movie. NOTE This must come before routes that display movie (uses id).
router.get("/movie/create", movie_controller.movie_create_get);

// POST request for creating movie.
router.post("/movie/create", movie_controller.movie_create_post);

// GET request to delete movie.
router.get("/movie/:id/delete", movie_controller.movie_delete_get);

// POST request to delete movie.
router.post("/movie/:id/delete", movie_controller.movie_delete_post);

// GET request to update movie.
router.get("/movie/:id/update", movie_controller.movie_update_get);

// POST request to update movie.
router.post("/movie/:id/update", movie_controller.movie_update_post);

// GET request for one movie.
router.get("/movie/:id", movie_controller.movie_detail);

// GET request for list of all movie items.
router.get("/movies", movie_controller.movie_list);

/// director ROUTES ///

// GET request for creating director. NOTE This must come before route for id (i.e. display director).
router.get("/director/create", director_controller.director_create_get);

// POST request for creating director.
router.post("/director/create", director_controller.director_create_post);

// GET request to delete director.
router.get("/director/:id/delete", director_controller.director_delete_get);

// POST request to delete director.
router.post("/director/:id/delete", director_controller.director_delete_post);

// GET request to update director.
router.get("/director/:id/update", director_controller.director_update_get);

// POST request to update director.
router.post("/director/:id/update", director_controller.director_update_post);

// GET request for one director.
router.get("/director/:id", director_controller.director_detail);

// GET request for list of all directors.
router.get("/directors", director_controller.director_list);

/// writer ROUTES ///

// GET request for creating writer. NOTE This must come before route for id (i.e. display writer).
router.get("/writer/create", writer_controller.writer_create_get);

// POST request for creating writer.
router.post("/writer/create", writer_controller.writer_create_post);

// GET request to delete writer.
router.get("/writer/:id/delete", writer_controller.writer_delete_get);

// POST request to delete writer.
router.post("/writer/:id/delete", writer_controller.writer_delete_post);

// GET request to update writer.
router.get("/writer/:id/update", writer_controller.writer_update_get);

// POST request to update writer.
router.post("/writer/:id/update", writer_controller.writer_update_post);

// GET request for one writer.
router.get("/writer/:id", writer_controller.writer_detail);

// GET request for list of all writers.
router.get("/writers", writer_controller.writer_list);

/// cast ROUTES ///

// GET request for creating cast. NOTE This must come before route for id (i.e. display cast).
router.get("/cast/create", cast_controller.cast_create_get);

// POST request for creating cast.
router.post("/cast/create", cast_controller.cast_create_post);

// GET request to delete cast.
router.get("/cast/:id/delete", cast_controller.cast_delete_get);

// POST request to delete cast.
router.post("/cast/:id/delete", cast_controller.cast_delete_post);

// GET request to update cast.
router.get("/cast/:id/update", cast_controller.cast_update_get);

// POST request to update cast.
router.post("/cast/:id/update", cast_controller.cast_update_post);

// GET request for one cast.
router.get("/cast/:id", cast_controller.cast_detail);

// GET request for list of all casts.
router.get("/casts", cast_controller.cast_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_controller.genre_create_get);

//POST request for creating Genre.
router.post("/genre/create", genre_controller.genre_create_post);

// GET request to delete Genre.
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request to update Genre.
router.get("/genre/:id/update", genre_controller.genre_update_get);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_controller.genre_list);

/// movieINSTANCE ROUTES ///

// GET request for creating a movieInstance. NOTE This must come before route that displays movieInstance (uses id).
router.get(
  "/movieinstance/create",
  movie_instance_controller.movieinstance_create_get
);

// POST request for creating movieInstance.
router.post(
  "/movieinstance/create",
  movie_instance_controller.movieinstance_create_post
);

// GET request to delete movieInstance.
router.get(
  "/movieinstance/:id/delete",
  movie_instance_controller.movieinstance_delete_get
);

// POST request to delete movieInstance.
router.post(
  "/movieinstance/:id/delete",
  movie_instance_controller.movieinstance_delete_post
);

// GET request to update movieInstance.
router.get(
  "/movieinstance/:id/update",
  movie_instance_controller.movieinstance_update_get
);

// POST request to update movieInstance.
router.post(
  "/movieinstance/:id/update",
  movie_instance_controller.movieinstance_update_post
);

// GET request for one movieInstance.
router.get("/movieinstance/:id", movie_instance_controller.movieinstance_detail);

// GET request for list of all movieInstance.
router.get("/movieinstances", movie_instance_controller.movieinstance_list);

module.exports = router;
