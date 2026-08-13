import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic async-fetch hook for service functions that return the
 * ADR response envelope: { success, data, message, error }.
 *
 * @param {() => Promise<{success:boolean,data:any,message:string,error:any}>} fetcher
 * @param {any[]} deps
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch]);

  return { data, error, isLoading, refetch };
}
