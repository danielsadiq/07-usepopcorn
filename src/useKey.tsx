import { useEffect } from "react";

export function useKey(keyCode:string, action:()=>void){
  useEffect(
      function () {
        function callback(e: KeyboardEvent) {
          if (e.code.toLowerCase() === keyCode.toLowerCase()) {
            action();
          }
        }
        document.addEventListener("keydown", callback);
        return function () {
          document.removeEventListener("keydown", callback);
        };
      },
      [action, keyCode]
    );
}