import React, {createContext, useContext} from 'react';

const SearchElevationContext = createContext(true);

export const SearchElevationProvider = SearchElevationContext.Provider;

/** When false, search UI uses borders only (no elevation) — avoids Android shadow ghosts during overlay fade. */
export const useSearchElevated = () => useContext(SearchElevationContext);
