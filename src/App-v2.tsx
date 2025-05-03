/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
import { useState, ReactNode, useEffect } from "react";
import StarRating from "./StarRatingmine";

type WatchedMovieType = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  runtime: number;
  imdbRating: number;
  userRating: number;
};
type MovieType = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
};

const API_KEY = "83650d26";

const average = (arr: number[]) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [watched, setWatched] = useState<WatchedMovieType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const query = "interstellar";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const {signal} = controller;
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`
        , {signal});
        if (!res.ok)
          throw new Error("Something went wrong with fetching the movie");
        // After this error message, the remainder of the code is not executed.

        const data = await res.json();
        if (data.Response === "False") throw new Error("Movie not found");
        setMovies(data.Search);
        setError("");
      } catch (error) {
        if (error instanceof Error) {
          if (error.name !== "AbortError") setError(error.message); // Now TypeScript knows 'error' has a 'message' property
        } else {
          setError("An unexpected error occurred."); // Handle cases where the thrown value isn't an Error
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }
    handleCloseMovie();
    fetchMovies();
    return function(){
      controller.abort();
    }
  }, [query]);

  function handleSelectMovie(id: string) {
    setSelectedId((selectedId) => (id === selectedId ? "" : id));
  }

  function handleCloseMovie() {
    setSelectedId("");
  }

  function handleAddWatched(movie: WatchedMovieType) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id:string){
    setWatched(watched => watched.filter(movie => movie.imdbID !==id))
  }
  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

function Navbar({ children }: { children: ReactNode }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => {
        
        setQuery(e.target.value)}}
    />
  );
}

function NumResults({ movies }: { movies: MovieType[] }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }: { children: ReactNode }) {
  return <main className="main">{children}</main>;
}

function Box({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({
  movies,
  handleSelectMovie,
}: {
  movies: MovieType[];
  handleSelectMovie: (id: string) => void;
}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}

function Movie({
  movie,
  handleSelectMovie,
}: {
  movie: MovieType;
  handleSelectMovie: (id: string) => void;
}) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

type SelectedMovie = {
  Title: string;
  Year: string;
  Poster: string;
  Runtime: string;
  imdbRating: number;
  Plot: string;
  Released: boolean;
  Actors: string[];
  Director: string;
  Genre: string;
};

function MovieDetails({
  selectId,
  onCloseMovie,
  onAddWatched,
  watched,
}: {
  selectId: string;
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovieType) => void;
  watched: WatchedMovieType[];
}) {
  const [movie, setMovie] = useState<SelectedMovie>({} as SelectedMovie);
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectId);
  const watchedUserRating = watched.find(movie => movie.imdbID === selectId)?.userRating;
  function handleAdd() {
    const newWatchedMovie: WatchedMovieType = {
      imdbID: selectId, // Changed from imdbId to imdbID
      Title: title, // Changed from title to Title
      Year: year, // Changed from year to Year
      Poster: poster, // Changed from poster to Poster
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }
  useEffect(function(){
    function callback(e: KeyboardEvent){
      if(e.code === "Escape"){
        onCloseMovie();
      }
    }
    document.addEventListener('keydown',callback);
    return function(){
      document.removeEventListener("keydown", callback);
    }
  }, [onCloseMovie]);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectId]);

  useEffect(function(){
    if (!title) return
    document.title = `MOVIE | ${title}`;
    return function(){
      document.title = `usePopcorn`;
    }
  },[title])

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating} <span>⭐</span></p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }: { watched: WatchedMovieType[] }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }: { watched: WatchedMovieType[], onDeleteWatched: (id:string)=>void }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }: { movie: WatchedMovieType, onDeleteWatched: (id:string)=>void  }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  );
}
