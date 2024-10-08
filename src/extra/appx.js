import { useState } from "react";

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

export default function App() {
    return (
        <>
            <Navbar />
            <main className="main">
                <ListBox />
                <WatchedBox />
            </main>
        </>
    );
}

function Navbar() {
    return (
        <nav className="nav-bar">
            <Logo />
            <Search />
            <NumResults />
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

function Search() {
    const [query, setQuery] = useState("");
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

function NumResults() {
    return (
        <p className="num-results">
            Found <strong>X</strong> results
        </p>
    );
}

function ListBox() {
    const [isOpen1, setIsOpen1] = useState(true);

    return (
        <div className="box">
            <ButtonToggle isOpen={isOpen1} onIsOpen={setIsOpen1} />
            {isOpen1 && <MovieList />}
        </div>
    );
}

function MovieList() {
    const [movies, setMovies] = useState(tempMovieData);
    return (
        <ul className="list">
            {movies?.map((movie) => (
                <Movie movie={movie} />
            ))}
        </ul>
    );
}

function WatchedBox() {
    const [watched, setWatched] = useState(tempWatchedData);
    const [isOpen2, setIsOpen2] = useState(true);

    return (
        <div className="box">
            <ButtonToggle isOpen={isOpen2} onIsOpen={setIsOpen2} />
            {isOpen2 && (
                <>
                    <WatchedSummary watched={watched} />
                    <WatchedMovieList watched={watched} />
                </>
            )}
        </div>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <WatchData emoji="️️⃣" data={watched.length}>
                    {" "}
                    movies
                </WatchData>
                <WatchData emoji="️️⭐️" data={avgImdbRating} />
                <WatchData emoji="️️🌟" data={avgUserRating} />
                <WatchData emoji="️️⏳" data={avgRuntime}>
                    {" "}
                    min
                </WatchData>
            </div>
        </div>
    );
}

function WatchedMovieList({ watched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <Movie movie={movie} />
            ))}
        </ul>
    );
}

function ButtonToggle({ isOpen, onIsOpen }) {
    return (
        <button
            className="btn-toggle"
            onClick={() => onIsOpen((open) => !open)}
        >
            {isOpen ? "–" : "+"}
        </button>
    );
}

function Movie({ movie }) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            {movie.userRating ? (
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
                </div>
            ) : (
                <div>
                    <p>
                        <span>🗓</span>
                        <span>{movie.Year}</span>
                    </p>
                </div>
            )}
        </li>
    );
}

function WatchData({ emoji, data, children }) {
    return (
        <p>
            <span>{emoji}</span>
            <span>
                {data} {children ? children : ""}
            </span>
        </p>
    );
}
