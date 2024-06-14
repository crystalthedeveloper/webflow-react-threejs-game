// path: src/components/Popup.js
import React from 'react';
import '../styles.css';

const Popup = ({ message, children }) => {
  return (
    <div className="popup">
      <div className="popup-content">
        <h2 dangerouslySetInnerHTML={{ __html: message }}></h2>
        {children}
      </div>
    </div>
  );
};

export default Popup;
