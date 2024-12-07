// src/components/DiagramCanvas.js
import React, { useEffect, useRef } from 'react';
import { dia, shapes } from 'jointjs';
import 'jointjs/dist/joint.css';

const DiagramCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Création d'un graphique JointJS pour dessiner des diagrammes UML
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      el: canvasRef.current,
      model: graph,
      width: 800,
      height: 600,
      gridSize: 10,
      drawGrid: true,
    });

    // Exemple d'ajout d'une classe UML
    const umlClass = new shapes.standard.Rectangle();
    umlClass.position(100, 50);
    umlClass.resize(100, 40);
    umlClass.attr({
      body: {
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
      },
      label: {
        text: 'EasyClass',
        fill: 'black',
      },
    });
    umlClass.addTo(graph);

    return () => {
      paper.remove(); // Nettoyage lors du démontage du composant
    };
  }, []);

  return <div ref={canvasRef} style={{ border: '1px solid #000', margin: '20px auto' }}></div>;
};

export default DiagramCanvas;
