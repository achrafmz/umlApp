// src/ClassBox.js
import React from 'react';
import { useDrag } from 'react-dnd';

const ClassBox = ({ name, x, y }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'CLASS',
        item: { name, x, y },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                opacity: isDragging ? 0.5 : 1,
                position: 'absolute',
                left: x,
                top: y,
                border: '1px solid black',
                padding: '10px',
                backgroundColor: 'white',
                cursor: 'move',
            }}
        >
            <strong>{name}</strong>
            <div>Attributs:</div>
            <div>Methods:</div>
        </div>
    );
};

export default ClassBox;
