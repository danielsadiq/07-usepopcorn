import { useEffect, useState } from "react";
import { WatchedMovieType } from "./App";

export function useLocalStorageState(key:string, initialItems:[] = []): [WatchedMovieType[], React.Dispatch<React.SetStateAction<WatchedMovieType[]>>] {
  const [value, setValue] = useState<WatchedMovieType[]>(function(){
      const storedValue = localStorage.getItem(key)
      return storedValue ? JSON.parse(storedValue ?? '[]') : initialItems;
    });
    useEffect(function(){
      localStorage.setItem(key, JSON.stringify(value))
    }, [value])
    return [value, setValue]
}



// export function useLocalStorageState(initialState:[], key:string) {
//   const [value, setWatched] = useState<WatchedMovieType[]>(function(){
//       const storedValue = localStorage.getItem(key)
//       return storedValue ? JSON.parse(storedValue ?? '[]') : initialState;
//     });
//     useEffect(function(){
//       localStorage.setItem(key, JSON.stringify(value))
//     }, [key])
//     return [value, setWatched]
// }