// src/components/Toolbar.js
import React from 'react';

const Toolbar = ({ onAddClass }) => {
    return (
        <div style={{ marginBottom: '10px' }}>
            <button onClick={onAddClass}>Ajouter une Classe</button>
        </div>
    );
};

export default Toolbar;
