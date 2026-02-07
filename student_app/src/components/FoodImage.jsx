import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const CACHE_KEY = 'unsplash_cache';
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// Simple in-memory cache to avoid hitting API limits during session
const memoryCache = {};

const FoodImage = ({ query, className, alt }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) return;

    // Check memory cache first
    if (memoryCache[query]) {
        setImageUrl(memoryCache[query]);
        return;
    }

    // Check local storage cache (persistent across reloads)
    try {
        const localCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (localCache[query] && localCache[query].expiry > Date.now()) {
            setImageUrl(localCache[query].url);
            memoryCache[query] = localCache[query].url;
            return;
        }
    } catch (e) {
        console.error("Cache read error", e);
    }

    const fetchImage = async () => {
      try {
        if (!UNSPLASH_ACCESS_KEY) {
            throw new Error("No API Key");
        }

        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!res.ok) throw new Error("API Request Failed");

        const data = await res.json();
        if (data.results && data.results.length > 0) {
            const url = data.results[0].urls.small;
            setImageUrl(url);
            
            // Save to caches (valid for 24 hours to save API calls)
            memoryCache[query] = url;
            const localCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            localCache[query] = { url, expiry: Date.now() + 24 * 60 * 60 * 1000 };
            localStorage.setItem(CACHE_KEY, JSON.stringify(localCache));
        } else {
            setError(true);
        }
      } catch (err) {
        console.error("Unsplash Fetch Error:", err);
        setError(true);
      }
    };

    fetchImage();
  }, [query]);

  if (error || !imageUrl) {
    // Fallback placeholder
    return (
        <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-400`}>
            <Search className="w-6 h-6" />
        </div>
    );
  }

  return <img src={imageUrl} alt={alt || query} className={className} />;
};

export default FoodImage;
