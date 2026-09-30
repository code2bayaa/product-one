import React, { createContext, useState, useEffect, useContext, useCallback } from "react";

const KeysContext = createContext({
  safeKeys: {},
  loadKeys: () => {},
});

export const useKeys = () => useContext(KeysContext);

export const KeyProvider = ({ children }) => {
  const [safeKeys, setSafeKeys] = useState({});
  //stable across renders, so pages can list it as an effect dependency
  const loadKeys = useCallback(async () => {
    try {
      // console.log(process.env.REACT_APP_ENVIRONMENT,"dev",process.env.REACT_APP_KEYS_LIVE)
      const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_KEYS : process.env.REACT_APP_KEYS_LIVE}`)

      const { keys } = await response.json()
      // console.log(keys,"keys")
      setSafeKeys(() => ({ ...keys }))
    } catch (error) {
      console.log(error, "error")
    }
  }, [])
  useEffect(() => {
    //load keys
    loadKeys()
  }, [loadKeys]);

  return (
    <KeysContext.Provider value={{ safeKeys, loadKeys }}>
      {children}
    </KeysContext.Provider>
  );
};
