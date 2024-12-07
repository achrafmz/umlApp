import React from 'react';

const Sidebar = ({ addClass }) => {
  const handleAddClass = () => {
    const className = prompt('Nom de la classe UML :');
    if (className) {
      addClass(className);
    }
  };

  return (
    <div className="sidebar">
      <button onClick={handleAddClass}>Ajouter une classe</button>
      {/* Ajoutes d'autres boutons ou options ici */}
    </div>
  );
};

export default Sidebar;
