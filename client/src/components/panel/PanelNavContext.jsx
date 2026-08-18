import { createContext, useContext } from "react";

const PanelNavContext = createContext({ navigateTo: () => {} });

export function PanelNavProvider({ navigateTo, children }) {
  return (
    <PanelNavContext.Provider value={{ navigateTo }}>
      {children}
    </PanelNavContext.Provider>
  );
}

export function usePanelNav() {
  return useContext(PanelNavContext);
}
