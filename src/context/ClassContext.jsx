import { createContext, useContext, useState } from 'react';

const ClassContext = createContext(null);

export function ClassProvider({ children }) {
  const [activeClass, setActiveClass] = useState(() => {
    const stored = localStorage.getItem('activeClass');
    return stored ? JSON.parse(stored) : null;
  });

  const selectClass = (cls) => {
    setActiveClass(cls);
    localStorage.setItem('activeClass', JSON.stringify(cls));
  };

  const clearClass = () => {
    setActiveClass(null);
    localStorage.removeItem('activeClass');
  };

  return (
    <ClassContext.Provider value={{ activeClass, selectClass, clearClass }}>
      {children}
    </ClassContext.Provider>
  );
}

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) throw new Error('useClass must be used within ClassProvider');
  return context;
};