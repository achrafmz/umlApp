import React from 'react';

const RelationComponent = ({ from, to }) => {
  return (
    <svg className="relation-line">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="black" />
    </svg>
  );
};

export default RelationComponent;
