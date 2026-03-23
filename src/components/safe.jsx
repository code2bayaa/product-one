import React, { createContext, useState, useEffect, useContext } from "react";

const KeysContext = createContext({
  safeKeys: {},
});

export const useKeys = () => useContext(KeysContext);

export const KeyProvider = ({ children }) => {
  const [safeKeys, setSafeKeys] = useState({});

  useEffect(() => {
    //load keys
    async function loadKeys() {
      try {
        console.log(process.env.REACT_APP_ENVIRONMENT,"dev")
        const response = await fetch(`${process.env.REACT_APP_ENVIRONMENT === "development" ? process.env.REACT_APP_KEYS : process.env.REACT_APP_KEYS_LIVE}`)

        const { keys } = await response.json()

        setSafeKeys(() => ({ ...keys }))
      } catch (error) {
        console.log(error, "error")
      }
    }
    loadKeys()
  }, []);

  return (
    <KeysContext.Provider value={{ safeKeys }}>
      {children}
    </KeysContext.Provider>
  );
};
