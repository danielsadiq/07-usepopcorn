// A nice strategy is to use named exports for custom hooks
// and default exports for components
import { useState, useEffect } from "react";
import { MovieType } from "./App";

export const API_KEY = "83650d26";
export function useMovies(query:string, callback:()=>void ){
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    // callback?.();
    const controller = new AbortController();
    const { signal } = controller;
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
          { signal }
        );
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
    // handleCloseMovie();
    callback?.()
    fetchMovies();
    return function () {
      controller.abort();
    };
  }, [query]);
  return {movies, isLoading, error};
}