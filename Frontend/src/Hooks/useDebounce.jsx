import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any value (e.g. search inputs, filter changes).
 * @param {*} value The value to debounce
 * @param {number} delay Delay in milliseconds (default: 400ms)
 * @returns {*} The debounced value
 */
export const useDebounce = (value, delay = 400) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
