// src/Canvas.js
import React, { useState } from 'react';
import { Stage, Layer } from 'react-konva';
import ClassBox from './ClassBox';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Canvas = () => {
    const [classes, setClasses] = useState([]);

    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: 'CLASS',
        drop: (item, monitor) => {
            const delta = monitor.getDifferenceFromInitialOffset();
            const newClass = {
                name: item.name,
                x: item.x + delta.x,
                y: item.y + delta.y,
            };
            setClasses((prevClasses) => [...prevClasses, newClass]);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
            canDrop: !!monitor.canDrop(),
        }),
    }));

    return (
        <DndProvider backend={HTML5Backend}>
            <div
                ref={drop}
                style={{ width: '100%', height: '600px', position: 'relative' }}
            >
                <Stage width={window.innerWidth} height={600}>
                    <Layer>
                        {classes.map((cls, index) => (
                            <ClassBox key={index} name={cls.name} x={cls.x} y={cls.y} />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </DndProvider>
    );
};

export default Canvas;
