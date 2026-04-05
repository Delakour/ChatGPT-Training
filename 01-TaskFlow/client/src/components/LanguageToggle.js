import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button 
      className="language-toggle-btn"
      onClick={toggleLanguage}
      title={language === 'english' ? 'Switch to Hebrew' : 'Switch to English'}
    >
      {language === 'english' ? '🇮🇱 עברית' : '🇺🇸 English'}
    </button>
  );
}

export default LanguageToggle;
