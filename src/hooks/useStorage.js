import { useState, useEffect } from "react";
import { userKey } from "../utils/auth";

export function useStorage(baseKey, initial, session) {
  const storageKey = userKey(baseKey, session);

  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      const item = localStorage.getItem(storageKey);
      setValue(item ? JSON.parse(item) : initial);
    } catch {
      setValue(initial);
    }
  }, [storageKey]);

  function set(next) {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try {
        localStorage.setItem(storageKey, JSON.stringify(resolved));
      } catch (e) {
        console.warn("localStorage write failed", e);
      }
      return resolved;
    });
  }

  return [value, set];
}
