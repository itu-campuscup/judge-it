"use client";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, ReactNode } from "react";
import { EmotionCache } from "@emotion/cache";

// Define your theme here or import it
const theme = createTheme({
  // Your theme customizations
});

interface ThemeRegistryOptions {
  key: string;
}

interface ThemeRegistryProps {
  options: ThemeRegistryOptions;
  children: ReactNode;
}

interface CacheState {
  cache: EmotionCache;
  flush: () => string[];
}

export default function ThemeRegistry({
  options,
  children,
}: ThemeRegistryProps) {
  const [{ cache, flush }] = useState<CacheState>(() => {
    const cache = createCache(options); // 'options' will be { key: 'mui' }
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = (): string[] => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let html = "";
    for (const name of names) {
      html += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* MUI's baseline styles */}
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
