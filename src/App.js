import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    },
    {
        imdbID: "tt6751668",
        Title: "Parasite",
        Year: "2019",
        Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
    },
];

const tempWatchedData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        runtime: 148,
        imdbRating: 8.8,
        userRating: 10,
    },
    {
        imdbID: "tt0088763",
        Title: "Back to the Future",
        Year: "1985",
        Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        runtime: 116,
        imdbRating: 8.5,
        userRating: 9,
    },
];

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "83650d26";

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [error, setError] = useState("");
    const [movieId, setMovieId] = useState("");

    useEffect(function () {

        const controller = new AbortController();

        async function fetchMovies() {
            const url = `https://www.omdbapi.com/?s=${query.split(" ").join("+")}&apikey=${KEY}`
            try {
                setisLoading(true);
                setError("");

                const res = await fetch(url, {signal:controller.signal});
                const data = await res.json();

                if (data.Response === "False") throw new Error("Movie not found");
                setMovies(data.Search);

                setError("");                
            } catch (err) {
                if (err.name !== "AbortError"){
                    setError(err.message);
                }
                console.log(err.message);
            }finally{
                setisLoading(false);
            }
        }
        if (query.length < 3){
            setMovies([]);
            setError("");
            return
        }
        fetchMovies();

        return function (){
            controller.abort();
        }
    }, [query]);

    function handleSetMovie(id){
        setMovieId(movieId => id===movieId ? null : id);
    }

    function handleAddWatched(movie){
        setWatched(watched => [...watched, movie]);
    }
    
    function handleDeleteMovie(movie){
        setWatched(watched => watched.filter(x => x.imdbID !== movie.imdbID));
    }

    return (
        <>
            <Navbar>
                <Search query={query} setQuery={setQuery} />
                <SearchResult movies={movies} />
            </Navbar>

            <Main>
                <Box>
                    {/* {isLoading ? <Loader /> : <ListMovies movies={movies} />} */}
                    {isLoading && <Loader/>}
                    {!isLoading && !error && <ListMovies movies={movies} setMovieId={handleSetMovie}/>}
                    {error && <ErrorMessage message={error}/> }
                </Box>
                <Box>
                    {movieId ? <MovieDetails watched={watched} movieId={movieId} setMovieId={setMovieId} onAddWatched={handleAddWatched}/> :
                    <>
                    <Summary watched={watched} />
                    <WatchedMovies watched={watched} onDeleteMovie={handleDeleteMovie} />
                    </>
                    }
                </Box>
            </Main>
        </>
    );
}

function Navbar({ children }) {
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

function Search({query, setQuery}) {
    function handleChange(e) {
        setQuery(e.target.value);
    }

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={handleChange}
        />
    );
}

function SearchResult({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

function Button({ isOpen, setIsOpen }) {
    return (
        <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>
    );
}

function ListMovies({ movies, setMovieId }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <li key={movie.imdbID} onClick={() => setMovieId(movie.imdbID)}>
                    <img src={movie.Poster} alt={`${movie.Title} poster`} />
                    <h3>{movie.Title}</h3>
                    <div>
                        <p>
                            <span>🗓</span>
                            <span>{movie.Year}</span>
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function MovieDetails({watched, movieId, setMovieId, onAddWatched}){
    const [movie, setMovie] = useState({});
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
    

    function handleAdd(){
        const val = {
            imdbID: movieId,
            title,
            year,
            poster,
            runtime: Number(runtime.split(' ').at(0)),
            imdbRating: Number(imdbRating),
            userRating,
        }
        onAddWatched(val);
        setMovieId(null);
    };

    function onCloseMovie(){
        setMovieId(null)
    }
    const isWatched = watched.map(movie => movie.imdbID).includes(movieId)
    const movieFound = watched.filter(movie => movie.imdbID === movieId)
    
    

    useEffect(function(){
        const url = `http://www.omdbapi.com/?i=${movieId}&apikey=${KEY}`;
        async function getData(){
            setIsLoading(true);
            const res = await fetch(url);
            const data = await res.json();
            setMovie(data);
            setIsLoading(false);
        }
        getData();

    }, [movieId])

    useEffect(function(){
        if (!title) return;
        document.title = `MOVIE | ${title}`;

        return () => document.title = "usePopcorn";
    }, [title, movieId])


    useEffect(function(){

        const callback = (e)=> {
            if (e.code === "Escape"){
                onCloseMovie();                
            }
        }
        // You can't copy and past the function for the remove eventlistener
        // It must be the function stored in the same variable.
        document.addEventListener("keydown", callback)

        return ()=>{
            document.removeEventListener("keydown", callback)
        }
    }, [])


    function onSetRating(num){
        setUserRating(num);
        // Rather than using this function, you can just pass the 
        // setUserRating to the onSetRaing of the StarRating component.
    }
    
    return <div className="details">
        {isLoading ? <Loader/> : 
        <>
        <header>
            <button className="btn-back" onClick={onCloseMovie}>
                &larr;
            </button>
            <img src={poster} alt={`Poster of ${title}`}/>
            <div className="details-overview">
                <h2>{title}</h2>
                <p>{released} • {runtime}</p>
                <p>{genre}</p>
                <p><span>⭐</span>{imdbRating} IMDb rating</p>
            </div>
        </header>
        <section>
            <div className="rating">
                {movieFound.length > 0 ? <p>You rated this movie {movieFound[0].userRating} 🌟</p> : <>
                
                <StarRating max={10} size={28} onSetRating={onSetRating} />
                {userRating > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}
                
                </>} 
                
            </div>
            <p><em>{plot}</em></p>
            <p>Starrring {actors}</p>
            <p>Directed By {director}</p>
        </section>
        </>
        }
    </div>
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function ErrorMessage({message}){
    return <p className="error">
        <span>⛔</span>{message}
    </p>
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <Button isOpen={isOpen} setIsOpen={setIsOpen} />
            {isOpen && children}
        </div>
    );
}

function WatchedMovies({ watched, onDeleteMovie }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <li key={movie.imdbID}>
                    <img src={movie.poster} alt={`${movie.title} poster`} />
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
                        <p>
                            <button className="btn-delete" onClick={() => onDeleteMovie(movie)}>❌</button>
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

function Summary({ watched }) {
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
                    <span>{avgRuntime.toFixed(2)} min</span>
                </p>
            </div>
        </div>
    );
}

