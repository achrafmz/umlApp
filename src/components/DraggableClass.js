import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableClass = ({ className }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'CLASS',
    item: { className },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }} className="draggable-class">
      <h3>{className}</h3>
    </div>
  );
};

export default DraggableClass;
