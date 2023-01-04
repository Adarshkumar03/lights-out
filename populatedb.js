#! /usr/bin/env node

console.log('This script populates some test movies, directors, writers, casts, genres and movieinstances to database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Movie = require('./models/movie')
var Director = require('./models/director')
var Writer = require("./models/writer")
var Cast = require("./models/cast")
var Genre = require('./models/genre')
var MovieInstance = require('./models/movieinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var writers = []
var genres = []
var movies = []
var movieinstances = []
var casts = []
var directors = []

function directorCreate(full_name, d_birth, d_death, cb) {
  directordetail = {fullName: full_name}
  if (d_birth != false) directordetail.date_of_birth = d_birth
  if (d_death != false) directordetail.date_of_death = d_death
  var director = new Director(directordetail);
       
  director.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Director: ' + director);
    directors.push(director)
    cb(null, director)
  }  );
}

function castCreate(full_name, d_birth, d_death, cb) {
  castdetail = {fullName: full_name}
  if (d_birth != false) castdetail.date_of_birth = d_birth
  if (d_death != false) castdetail.date_of_death = d_death
  var cast = new Cast(castdetail);
       
  cast.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Cast: ' + cast);
    casts.push(cast)
    cb(null, cast)
  }  );
}

function writerCreate(full_name, d_birth, d_death, cb) {
  writerdetail = {fullName: full_name}
  if (d_birth != false) writerdetail.date_of_birth = d_birth
  if (d_death != false) writerdetail.date_of_death = d_death
  var writer = new Writer(writerdetail);
       
  writer.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New writer: ' + writer);
    writers.push(writer)
    cb(null, writer)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function movieCreate(name, rating, description, dor, genre, directors, writers, casts, cb) {
  moviedetail = { 
    name: name,
    rating:rating,
    description: description,
    date_of_release: dor,
  }
  if (genre != false) moviedetail.genre = genre
  if (writers != false) moviedetail.writers = writers
  if (directors != false) moviedetail.directors = directors
  if (casts != false) moviedetail.casts = casts
    
  var movie = new Movie(moviedetail);    
  movie.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Movie: ' + movie);
    movies.push(movie)
    cb(null, movie)
  }  );
}


function movieInstanceCreate(movie, status, cb) {
  movieinstancedetail = { 
    movie: movie,
  }    
  if (status != false) movieinstancedetail.status = status
    
  var movieinstance = new MovieInstance(movieinstancedetail);    
  movieinstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING MovieInstance: ' + movieinstance);
      cb(err, null)
      return
    }
    console.log('New MovieInstance: ' + movieinstance);
    movieinstances.push(movieinstance)
    cb(null, movie)
  }  );
}


function createDirectors(cb) {
    async.series([
        function(callback) {
          directorCreate('Martin Scorsese', '1942-11-17', false, callback);
        },
        function(callback) {
          directorCreate('David Fincher', '1962-08-28', false, callback);
        },
        function(callback) {
          directorCreate('Damien Chazelle', '1985-01-19', false, callback);
        },
        function(callback) {
          directorCreate('Bong Joon-ho', '1969-09-14', false, callback);
        },
        function(callback) {
          writerCreate('Bong Joon-ho', '1969-09-14', false, callback);
        },
        function(callback) {
          writerCreate('Damien Chazelle', '1985-01-19', false, callback);
        },
        function(callback) {
          writerCreate('Jim Ulhs', '1957-03-25', false, callback);
        },
        function(callback) {
          writerCreate('William Monahan', '1960-11-03', false, callback);
        },
        function(callback) {
          castCreate('Leonardo DiCaprio', '1974-11-11', false, callback);
        },
        function(callback) {
          castCreate('Matt Damon', '1970-10-08', false, callback);
        },
        function(callback) {
          castCreate('Ryan Gosling', '1980-11-12', false, callback);
        },
        function(callback) {
          castCreate('Emma Stone', '1988-11-06', false, callback);
        },
        function(callback) {
          castCreate('Song Kang-ho', '1967-01-17', false, callback);
        },
        function(callback) {
          castCreate('Lee Sun-kyun', '1975-03-02', false, callback);
        },
        function(callback) {
          castCreate('Bradd Pitt', '1963-12-18', false, callback);
        },
        function(callback) {
          castCreate('Edward Norton', '1969-08-18', false, callback);
        },
        function(callback) {
          genreCreate("Fantasy", callback);
        },
        function(callback) {
          genreCreate("Comedy", callback);
        },
        function(callback) {
          genreCreate("Horror", callback);
        },
        function(callback) {
          genreCreate("Thriller", callback);
        },
        function(callback) {
          genreCreate("Romance", callback);
        },
        function(callback) {
          genreCreate("Action", callback);
        },
        function(callback) {
          genreCreate("Drama", callback);
        },
        ],
        // optional callback
        cb);
}


function createMovies(cb) {
    async.parallel([
        function(callback) {
          movieCreate('Fight Club', 
          8.8,
          'Fight Club is a 1999 American film directed by David Fincher and starring Brad Pitt, Edward Norton, and Helena Bonham Carter. It is based on the 1996 novel of the same name by Chuck Palahniuk. Norton plays the unnamed narrator, who is discontented with his white-collar job. He forms a "fight club" with soap salesman Tyler Durden (Pitt), and becomes embroiled in a relationship with a mysterious[5][6] woman, Marla Singer (Bonham Carter).', 
          '1999-10-15',
          [genres[3],], 
          [directors[1],],
          [writers[2],], 
          [casts[6],casts[7]],  
          callback);
        },
        function(callback) {
          movieCreate('La La Land', 
          8.0,
          'La La Land is a 2016 American romantic musical comedy-drama film written and directed by Damien Chazelle. It stars Ryan Gosling and Emma Stone as a struggling jazz pianist and an aspiring actress, respectively, who meet and fall in love while pursuing their dreams in Los Angeles. John Legend, Rosemarie DeWitt, Finn Wittrock, and J. K. Simmons appear in supporting roles.', 
          '2016-08-31',
          [genres[4],], 
          [directors[2],],
          [writers[1],], 
          [casts[2],casts[3]],  
          callback);
        },
        function(callback) {
          movieCreate('Parasite', 
          8.5,
          'Parasite (Korean: 기생충; Hanja: 寄生蟲; RR: Gisaengchung) is a 2019 South Korean black comedy thriller film directed by Bong Joon-ho, who co-wrote the screenplay with Han Jin-won and co-produced the film. The film, starring Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik, Park So-dam, Jang Hye-jin, Park Myung-hoon, and Lee Jung-eun, follows a poor family who scheme to become employed by a wealthy family and infiltrate their household by posing as unrelated, highly qualified individuals.', 
          '2019-05-30',
          [genres[3],genres[6]], 
          [directors[3],],
          [writers[0],], 
          [casts[4],casts[5]],  
          callback);
        },
        function(callback) {
          movieCreate('The Departed', 
          8.5,
          'The Departed is a 2006 American epic crime thriller film[2][3][4] directed by Martin Scorsese and written by William Monahan.[5] It is both a remake of the 2002 Hong Kong film Infernal Affairs and also loosely based on the real-life Boston Winter Hill Gang; the character Colin Sullivan is based on the corrupt FBI agent John Connolly, while the character Frank Costello is based on Irish-American gangster Whitey Bulger.[6][7][8] The film stars Leonardo DiCaprio, Matt Damon, Jack Nicholson, and Mark Wahlberg, with Martin Sheen, Ray Winstone, Vera Farmiga, and Alec Baldwin in supporting roles.', 
          '2006-10-06',
          [genres[3]], 
          [directors[0],],
          [writers[3],], 
          [casts[0],casts[1]],  
          callback);
        },
        ],
        // optional callback
        cb);
}


function createMovieInstances(cb) {
    async.parallel([
        function(callback) {
          movieInstanceCreate(movies[0], 'Available', callback)
        },
        function(callback) {
          movieInstanceCreate(movies[1],'Sold', callback)
        },
        function(callback) {
          movieInstanceCreate(movies[2], 'ComingSoon', callback)
        },
        function(callback) {
          movieInstanceCreate(movies[3], 'Available', callback)
        },
        ],
        // Optional callback
        cb);
}

async.series([
    createDirectors,
    createMovies,
    createMovieInstances
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('MovieInstances: '+movieinstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



