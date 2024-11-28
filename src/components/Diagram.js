import React, { useEffect, useState } from 'react';
import { dia, shapes } from 'jointjs';
import 'jointjs/dist/joint.css';
import './Diagram.css';
import Toolbar from './Toolbar';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Diagram = () => {
    const [graph, setGraph] = useState(new dia.Graph());
    const [paper, setPaper] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [className, setClassName] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [methods, setMethods] = useState([]);
    const [currentElement, setCurrentElement] = useState(null);
    const [newAttribute, setNewAttribute] = useState('');
    const [newAttributeType, setNewAttributeType] = useState('string');
    const [newMethod, setNewMethod] = useState('');
    const [newMethodType, setNewMethodType] = useState('void');
    const [isLinkMode, setIsLinkMode] = useState(false);
    const [sourceClass, setSourceClass] = useState(null);

    const [linkModalIsOpen, setLinkModalIsOpen] = useState(false);
    const [currentLink, setCurrentLink] = useState(null);
    const [multiplicitySource, setMultiplicitySource] = useState('1');
    const [multiplicityTarget, setMultiplicityTarget] = useState('1');
    const [sourceCoords, setSourceCoords] = useState({ x: 0.1, y: 0 });
    const [targetCoords, setTargetCoords] = useState({ x: 0.9, y: 0 });

    const [isInheritanceMode, setIsInheritanceMode] = useState(false);
    const [parentClass, setParentClass] = useState(null);

    useEffect(() => {
        const newPaper = new dia.Paper({
            el: document.getElementById('paper'),
            model: graph,
            width: 800,
            height: 600,
            gridSize: 10,
        });

        newPaper.on('element:pointerdblclick', (elementView) => {
            const model = elementView.model;
            setCurrentElement(model);
            setClassName(model.attr('label/text'));
            setAttributes(JSON.parse(model.attr('attributes') || '[]')); // Charger les attributs
            setMethods(JSON.parse(model.attr('methods') || '[]'));       // Charger les méthodes
            setModalIsOpen(true);
        });

        newPaper.on('element:pointerclick', (elementView) => {
            if (isLinkMode) {
                if (!sourceClass) {
                    setSourceClass(elementView.model);
                } else {
                    createAssociation(sourceClass, elementView.model);
                    setSourceClass(null);
                    setIsLinkMode(false);
                }
            } else if (isInheritanceMode) {
                if (!parentClass) {
                    setParentClass(elementView.model);
                } else {
                    createInheritance(parentClass, elementView.model);
                    setParentClass(null);
                    setIsInheritanceMode(false);
                }
            }
        });

        // Événement pour le double-clic sur un lien d'association
        newPaper.on('link:pointerdblclick', (linkView) => {
            const link = linkView.model;
            setCurrentLink(link);
            setLinkModalIsOpen(true); // Ouvre le modal pour choisir la cardinalité ou supprimer le lien
        });

        setPaper(newPaper);
    }, [graph, isLinkMode, isInheritanceMode, sourceClass, parentClass]);

    const addClass = () => {
        const rect = new shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(200, 150);
        rect.attr({
            body: {
                fill: 'lightblue',
            },
            label: {
                text: className || 'Nouvelle Classe',
                fill: 'black',
            },
            attributes: JSON.stringify(attributes), // Attributs au format JSON
            methods: JSON.stringify(methods),       // Méthodes au format JSON
        });

        rect.addTo(graph);
        resetInputs();
    };

    const formatClassBox = () => {
        return `${className || 'Nouvelle Classe'}\n\n---\n${formatAttributes()}\n\n---\n${formatMethods()}`;
    };

    const formatAttributes = () => {
        return attributes.map(attr => `- ${attr.type} ${attr.name}`).join('\n');
    };

    const formatMethods = () => {
        return methods.map(method => `+ ${method.returnType} ${method.name}()`).join('\n');
    };

    const resetInputs = () => {
        setClassName('');
        setAttributes([]);
        setMethods([]);
        setNewAttribute('');
        setNewMethod('');
    };

    const handleSave = () => {
        if (currentElement) {
            currentElement.attr({
                label: {
                    text: formatClassBox(), // Formater les données pour l'affichage
                },
                attributes: JSON.stringify(attributes), // Sauvegarder les attributs
                methods: JSON.stringify(methods),       // Sauvegarder les méthodes
            });
            setModalIsOpen(false);
            resetInputs();
        }
    };

    const addAttribute = () => {
        setAttributes([...attributes, { name: newAttribute, type: newAttributeType }]);
        setNewAttribute('');
        setNewAttributeType('string');
    };

    const addMethod = () => {
        setMethods([...methods, { name: newMethod, returnType: newMethodType }]);
        setNewMethod('');
        setNewMethodType('void');
    };

    const deleteClass = () => {
        if (currentElement) {
            currentElement.remove();
            setModalIsOpen(false);
        }
    };

    const deleteAttribute = (index) => {
        const newAttributes = attributes.filter((_, i) => i !== index);
        setAttributes(newAttributes);
    };

    const deleteMethod = (index) => {
        const newMethods = methods.filter((_, i) => i !== index);
        setMethods(newMethods);
    };

    const createAssociation = (sourceClass, targetClass, multiplicitySource, multiplicityTarget) => {
        const link = new shapes.standard.Link();
        link.source(sourceClass);
        link.target(targetClass);
    
        // Obtenez les boîtes de délimitation des classes
        const sourceBox = sourceClass.getBBox();
        const targetBox = targetClass.getBBox();
    
        // Calculer les positions de la ligne de connexion
        const sourceCenterX = sourceBox.x + sourceBox.width / 2;
        const sourceCenterY = sourceBox.y + sourceBox.height / 2;
        const targetCenterX = targetBox.x + targetBox.width / 2;
        const targetCenterY = targetBox.y + targetBox.height / 2;
    
        // Calculer le milieu de la ligne (moyenne des centres des deux classes)
        const midX = (sourceCenterX + targetCenterX) / 2;
        const midY = (sourceCenterY + targetCenterY) / 2;
    
        // Ajouter l'association avec les cardinalités au centre de la ligne
        link.attr({
            line: {
                stroke: 'black',
                strokeWidth: 2,
                targetMarker: {
                    type: 'classic',
                    size: 10,
                },
            },
            labels: [
                {
                    position: { x: midX - 40, y: midY - 10 }, // Position de la cardinalité source
                    attrs: { text: { text: multiplicitySource, fill: 'black' } },
                },
                {
                    position: { x: midX + 40, y: midY - 10 }, // Position de la cardinalité cible
                    attrs: { text: { text: multiplicityTarget, fill: 'black' } },
                },
            ],
        });
    
        link.addTo(graph);
    };
    

    const createInheritance = (parentClass, childClass) => {
        const link = new shapes.standard.Link();
        link.source(childClass); // L'enfant est la source
        link.target(parentClass); // Le parent est la cible
        link.attr({
            line: {
                stroke: 'black',
                strokeWidth: 2,
                targetMarker: {
                    type: 'path',
                    d: 'M 10 -5 L 0 0 L 10 5 z', // Flèche remplie
                    fill: 'black',
                },
            },
        });
        link.addTo(graph);
    };

    const enableLinkMode = () => {
        setIsLinkMode(true);
    };

    const enableInheritanceMode = () => {
        setIsInheritanceMode(true);
    };

    const handleLinkSave = () => {
        if (currentLink) {
            currentLink.label(0, { position: sourceCoords, attrs: { text: { text: multiplicitySource, fill: 'black' } } });
            currentLink.label(1, { position: targetCoords, attrs: { text: { text: multiplicityTarget, fill: 'black' } } });
            setLinkModalIsOpen(false);
        }
    };

    const updateSourceCoords = (e) => {
        setSourceCoords({ x: e.target.value, y: sourceCoords.y });
    };

    const updateTargetCoords = (e) => {
        setTargetCoords({ x: e.target.value, y: targetCoords.y });
    };

    const deleteLink = () => {
        if (currentLink) {
            currentLink.remove();
            setLinkModalIsOpen(false);
        }
    };

    return (
        <div>
            <h1>Diagramme de Classes UML</h1>
            <Toolbar onAddClass={addClass} />
            <button onClick={enableLinkMode} disabled={isLinkMode || isInheritanceMode}>
                Relier deux classes
            </button>
            <button onClick={enableInheritanceMode} disabled={isLinkMode || isInheritanceMode}>
                Héritage
            </button>
            <button onClick={enableInheritanceMode} disabled={isLinkMode || isInheritanceMode}>
                Generer
            </button>
            <div id="paper" style={{ width: '800px', height: '600px', border: '1px solid black' }}></div>
            
            <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
                <h2>Modifier la Classe</h2>
                <label>Nom de la classe:</label>
                <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} />
                <div>
                    <h3>Attributs:</h3>
                    <ul>
                        {attributes.map((attribute, index) => (
                            <li key={index}>
                                {attribute.name} : {attribute.type}
                                <button onClick={() => deleteAttribute(index)}>Supprimer</button>
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        value={newAttribute}
                        onChange={(e) => setNewAttribute(e.target.value)}
                        placeholder="Nom de l'attribut"
                    />
                    <select
                        value={newAttributeType}
                        onChange={(e) => setNewAttributeType(e.target.value)}
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                    <button onClick={addAttribute}>Ajouter un attribut</button>
                </div>
                <div>
                    <h3>Methodes:</h3>
                    <ul>
                        {methods.map((method, index) => (
                            <li key={index}>
                                {method.name}() : {method.returnType}
                                <button onClick={() => deleteMethod(index)}>Supprimer</button>
                            </li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        value={newMethod}
                        onChange={(e) => setNewMethod(e.target.value)}
                        placeholder="Nom de la méthode"
                    />
                    <select
                        value={newMethodType}
                        onChange={(e) => setNewMethodType(e.target.value)}
                    >
                        <option value="void">void</option>
                        <option value="string">string</option>
                        <option value="number">number</option>
                    </select>
                    <button onClick={addMethod}>Ajouter une méthode</button>
                </div>
                <button onClick={handleSave}>Sauvegarder</button>
                <button onClick={deleteClass}>Supprimer la classe</button>
            </Modal>

            <Modal isOpen={linkModalIsOpen} onRequestClose={() => setLinkModalIsOpen(false)}>
                <h2>Modifier le lien</h2>
                <label>Cardinalité source:</label>
                <input type="number" value={multiplicitySource} onChange={(e) => setMultiplicitySource(e.target.value)} />
                <label>Cardinalité cible:</label>
                <input type="number" value={multiplicityTarget} onChange={(e) => setMultiplicityTarget(e.target.value)} />
                <div>
                    <button onClick={handleLinkSave}>Sauvegarder</button>
                    <button onClick={deleteLink}>Supprimer le lien</button>
                </div>
            </Modal>
        </div>
    );
};

export default Diagram;
