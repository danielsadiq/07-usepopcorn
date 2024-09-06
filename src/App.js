import { useEffect, useState } from "react";
import StarRating from "./StarRating";
import Summary from "./Summary";
import { Navbar, Search, SearchResult } from "./Navbar";



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
                setMovieId(null)                
            }
        }
        // You can't copy and past the function for the remove eventlistener
        // It must be the function stored in the same variable.
        document.addEventListener("keydown", callback)

        return ()=>{
            document.removeEventListener("keydown", callback)
        }
    }, [setMovieId])


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


