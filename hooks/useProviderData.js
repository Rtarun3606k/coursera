import { useState, useEffect, useCallback, useMemo } from "react";

// In-memory cache for provider data
const providerCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProviderData = (userEmail) => {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized cache key
  const cacheKey = useMemo(() => `provider_${userEmail}`, [userEmail]);

  // Check if data is in cache and still valid
  const getCachedData = useCallback(() => {
    if (!userEmail) return null;

    const cached = providerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cacheKey, userEmail]);

  // Store data in cache
  const setCachedData = useCallback(
    (data) => {
      if (!userEmail) return;

      providerCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
    },
    [cacheKey, userEmail]
  );

  // Fetch provider data with caching
  const fetchProviderData = useCallback(
    async (forceRefresh = false) => {
      if (!userEmail) {
        setProviderData(null);
        return;
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          setProviderData(cachedData);
          setError(null);
          return cachedData;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/provider/apply?email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const provider = data.provider || null;

          // Cache the result
          setCachedData(provider);
          setProviderData(provider);
          return provider;
        } else if (response.status === 404) {
          // No provider application found
          setCachedData(null);
          setProviderData(null);
          return null;
        } else {
          throw new Error("Failed to fetch provider data");
        }
      } catch (err) {
        console.error("Error fetching provider data:", err);
        setError(err.message);
        setProviderData(null);
      } finally {
        setLoading(false);
      }
    },
    [userEmail, getCachedData, setCachedData]
  );

  // Update provider data in cache after successful submission
  const updateProviderData = useCallback(
    (newData) => {
      setCachedData(newData);
      setProviderData(newData);
    },
    [setCachedData]
  );

  // Clear cache for this user
  const clearCache = useCallback(() => {
    providerCache.delete(cacheKey);
    setProviderData(null);
  }, [cacheKey]);

  // Initial fetch on mount or userId change
  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      providerData,
      loading,
      error,
      refetch: () => fetchProviderData(true), // Force refresh
      updateProviderData,
      clearCache,
    }),
    [
      providerData,
      loading,
      error,
      fetchProviderData,
      updateProviderData,
      clearCache,
    ]
  );
};

// Hook for clearing all cached data (useful for admin operations)
export const useClearAllProviderCache = () => {
  return useCallback(() => {
    providerCache.clear();
  }, []);
};

export default useProviderData;
