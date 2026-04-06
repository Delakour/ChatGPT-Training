import React, { createContext, useState, useContext } from 'react';
import vocabulary from '../vocabulary.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('english'); // Default language

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'english' ? 'hebrew' : 'english');
  };

  const t = (path) => {
    const keys = path.split('.');
    let value = vocabulary[language];
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return path; // Return path if translation not found
      }
    }
    
    return value || path;
  };

  const isRTL = language === 'hebrew';

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
