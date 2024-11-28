import React from 'react';

const ClassComponent = ({ className, attributes, methods }) => {
  return (
    <div className="uml-class">
      <h3>{className}</h3>
      <p>Attributes: {attributes.join(', ')}</p>
      <p>Methods: {methods.join(', ')}</p>
    </div>
  );
};

export default ClassComponent;
