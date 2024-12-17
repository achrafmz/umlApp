import React, { useRef, useEffect, useState } from 'react';
import { dia, shapes } from 'jointjs';
import 'jointjs/dist/joint.css';
import './Diagram.css';
import Toolbar from './Toolbar';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Diagram = () => {
    const paperRef = useRef(null);
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
    const [multiplicitySource, setMultiplicitySource] = useState('1..1');
    const [multiplicityTarget, setMultiplicityTarget] = useState('1..1');
    const [sourceCoords, setSourceCoords] = useState({ x: 0.1, y: 0 });
    const [targetCoords, setTargetCoords] = useState({ x: 0.9, y: 0 });

    const [isInheritanceMode, setIsInheritanceMode] = useState(false);
    const [parentClass, setParentClass] = useState(null);

    const [isInterfaceMode, setIsInterfaceMode] = useState(false);

    useEffect(() => {
        const newPaper = new dia.Paper({
            el: document.getElementById('paper'),
            model: graph,
            width: 1200,
            height: 800,
            gridSize: 10,
        });
    
        newPaper.on('element:pointerdblclick', (elementView) => {
            const model = elementView.model;
            setCurrentElement(model);
            setClassName(model.attr('label/text').split('\n')[0]); // Ne prendre que le titre
            setAttributes(JSON.parse(model.attr('attributes') || '[]'));
            setMethods(JSON.parse(model.attr('methods') || '[]'));
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
    
        newPaper.on('link:pointerdblclick', (linkView) => {
            const link = linkView.model;
            // Vérifie si le lien est un lien d'héritage
            if (link.attr('line/targetMarker/type') === 'path') {
                link.remove();
            } else {
                setCurrentLink(link);
                setMultiplicitySource(link.label(0)?.attrs?.text?.text || '1..1');
                setMultiplicityTarget(link.label(1)?.attrs?.text?.text || '1..1');
                setLinkModalIsOpen(true);
            }
        });
    
        setPaper(newPaper);
    }, [graph, isLinkMode, isInheritanceMode, sourceClass, parentClass]);
    

    const addClass = () => {
        const rect = new shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(200, 150);
        rect.attr({
            label: {
                text: className,
                fontSize: 12,
                fontFamily: 'Arial',
                textAnchor: 'middle',
            },
            body: {
                fill: 'lightgreen',
                stroke: 'black',
                strokeWidth: 2,
            },
        });

        rect.addTo(graph);
        resetInputs();
    };

    const addInterface = () => {
        const rect = new shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(200, 150);
        rect.attr({
            label: {
                text: `interface ${className}`,
                fontSize: 12,
                fontFamily: 'Arial',
                textAnchor: 'middle',
            },
            body: {
                fill: 'lightgreen',
                stroke: 'black',
                strokeWidth: 2,
                dasharray: '5,5', // Pour différencier visuellement les interfaces
            },
        });

        rect.addTo(graph);
        resetInputs();
    };

    const formatClassBox = () => {
        return `${className || 'Nouvelle Classe'}\n---\n${formatAttributes()}\n---------------------------------------------------\n${formatMethods()}`;
    };

    const formatInterfaceBox = () => {
        return `interface ${className || 'Nouvelle Interface'}\n---\n${formatMethods()}`;
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
        setNewAttributeType('string');
        setNewMethod('');
        setNewMethodType('void');
        setCurrentElement(null);
    };

    const handleSave = () => {
        if (currentElement) {
            currentElement.attr({
                label: {
                    text: `${className}\n---\n${formatAttributes()}\n---\n${formatMethods()}`, // Ne pas modifier le titre
                    fontSize: 12,
                    fontFamily: 'Arial',
                    textAnchor: 'middle',
                },
                attributes: JSON.stringify(attributes),
                methods: JSON.stringify(methods),
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
            resetInputs(); // Réinitialiser les champs après la suppression
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

    const createAssociation = (sourceClass, targetClass) => {
        const link = new shapes.standard.Link();
        link.source(sourceClass);
        link.target(targetClass);
        link.attr({
            line: {
                stroke: 'black',
                strokeWidth: 2,
                targetMarker: {
                    type: 'classic',
                    size: 10,
                },
            },
        });
    
        link.labels([
            {
                position: 0.1,
                attrs: {
                    text: {
                        text: multiplicitySource,
                        fill: 'black',
                        fontSize: 12,
                        fontWeight: 'bold',
                    },
                },
            },
            {
                position: 0.9,
                attrs: {
                    text: {
                        text: multiplicityTarget,
                        fill: 'black',
                        fontSize: 12,
                        fontWeight: 'bold',
                    },
                },
            },
        ]);
    
        link.addTo(graph);
        setIsLinkMode(false);  // Désactiver le mode après création du lien
    };
    
    const createInheritance = (parentClass, childClass) => {
        const link = new shapes.standard.Link();
        link.source(childClass);
        link.target(parentClass);
        link.attr({
            line: {
                stroke: 'black',
                strokeWidth: 2,
                targetMarker: {
                    type: 'path',
                    d: 'M 10 -5 L 0 0 L 10 5 z',
                    fill: 'black',
                },
            },
        });
        link.addTo(graph);
        setIsInheritanceMode(false);  // Désactiver le mode après création du lien
    };
    

    const createInterface = (element) => {
        const link = new shapes.standard.Link();
        link.source(element);
        link.target(currentElement);
        link.attr({
            line: {
                stroke: 'blue',
                strokeWidth: 2,
                targetMarker: {
                    type: 'path',
                    d: 'M 10 -5 L 0 0 L 10 5 z',
                    fill: 'blue',
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

    const enableInterfaceMode = () => {
        setIsInterfaceMode(true);
    };

    const handleLinkSave = () => {
        if (currentLink) {
            currentLink.label(0, { position: 0.1, attrs: { text: { text: multiplicitySource, fill: 'black' } } });
            currentLink.label(1, { position: 0.9, attrs: { text: { text: multiplicityTarget, fill: 'black' } } });
            setLinkModalIsOpen(false);
        }
    };

    const deleteLink = () => {
        if (currentLink) {
            currentLink.remove();
            setLinkModalIsOpen(false);
        }
    };

    const handleGenerateCode = () => {
        const code = generateJavaCode(graph);
        downloadCode(code, 'generated-code-java.txt');
    };

    const handleGeneratePHPCode = () => {
        const code = generatePHPCode(graph);
        downloadCode(code, 'generated-code-php.txt');
    };

    const handleGeneratePythonCode = () => {
        const code = generatePythonCode(graph);
        downloadCode(code, 'generated-code-python.txt');
    };

    const generateJavaCode = (graph) => {
        const elements = graph.getElements();
        const links = graph.getLinks();
        let code = '';

        const getInheritanceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'black' && link.attr('line/targetMarker/type') === 'path') {
                    const parentId = link.target().id;
                    const childId = link.source().id;
                    map.set(childId, parentId);
                }
            });
            return map;
        };

        const getInterfaceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'blue') {
                    const sourceId = link.source().id;
                    const targetId = link.target().id;
                    if (!map.has(targetId)) {
                        map.set(targetId, []);
                    }
                    map.get(targetId).push(sourceId);
                }
            });
            return map;
        };

        const inheritanceMap = getInheritanceMap(links);
        const interfaceMap = getInterfaceMap(links);

        elements.forEach((element) => {
            const className = element.attr('label/text').split('\n')[0];
            const attributes = JSON.parse(element.attr('attributes') || '[]');
            const methods = JSON.parse(element.attr('methods') || '[]');
            const parentClassId = inheritanceMap.get(element.id);
            const interfaces = interfaceMap.get(element.id) || [];

            if (className.startsWith('interface')) {
                code += `interface ${className.replace('interface ', '')} {\n`;
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    code += `    ${method.returnType} ${method.name}();\n`;
                });
                
                code += '}\n\n';
            } else {
                code += `public class ${className}`;
                if (parentClassId) {
                    const parentClassElement = elements.find(el => el.id === parentClassId);
                    const parentClassName = parentClassElement?.attr('label/text').split('\n')[0];
                    if (parentClassName) {
                        code += ` extends ${parentClassName}`;
                    }
                }
                if (interfaces.length > 0) {
                    code += ` implements ${interfaces.map(id => {
                        const interfaceElement = elements.find(el => el.id === id);
                        return interfaceElement?.attr('label/text').split('\n')[0].replace('interface ', '');
                    }).join(', ')}`;
                }
                code += ' {\n';
                
                // Ajouter les attributs
                attributes.forEach(attr => {
                    code += `    private ${attr.type} ${attr.name};\n`;
                });
                
                code += '\n';
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    const returnType = method.returnType;
                    const existingClass = elements.find(el => el.attr('label/text').split('\n')[0] === returnType);
                    const finalReturnType = existingClass ? returnType : method.returnType;
                    
                    code += `    public ${finalReturnType} ${method.name}() {\n`;
                    code += '        // TODO: implement this method\n';
                    code += '    }\n';
                });
                
                code += '}\n\n';
            }
        });

        return code;
    };

    const generatePHPCode = (graph) => {
        const elements = graph.getElements();
        const links = graph.getLinks();
        let code = '';

        const getInheritanceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'black' && link.attr('line/targetMarker/type') === 'path') {
                    const parentId = link.target().id;
                    const childId = link.source().id;
                    map.set(childId, parentId);
                }
            });
            return map;
        };

        const getInterfaceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'blue') {
                    const sourceId = link.source().id;
                    const targetId = link.target().id;
                    if (!map.has(targetId)) {
                        map.set(targetId, []);
                    }
                    map.get(targetId).push(sourceId);
                }
            });
            return map;
        };

        const inheritanceMap = getInheritanceMap(links);
        const interfaceMap = getInterfaceMap(links);

        elements.forEach((element) => {
            const className = element.attr('label/text').split('\n')[0];
            const attributes = JSON.parse(element.attr('attributes') || '[]');
            const methods = JSON.parse(element.attr('methods') || '[]');
            const parentClassId = inheritanceMap.get(element.id);
            const interfaces = interfaceMap.get(element.id) || [];

            if (className.startsWith('interface')) {
                code += `interface ${className.replace('interface ', '')} {\n`;
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    code += `    public function ${method.name}();\n`;
                });
                
                code += '}\n\n';
            } else {
                code += `class ${className}`;
                if (parentClassId) {
                    const parentClassElement = elements.find(el => el.id === parentClassId);
                    const parentClassName = parentClassElement?.attr('label/text').split('\n')[0];
                    if (parentClassName) {
                        code += ` extends ${parentClassName}`;
                    }
                }
                if (interfaces.length > 0) {
                    code += ` implements ${interfaces.map(id => {
                        const interfaceElement = elements.find(el => el.id === id);
                        return interfaceElement?.attr('label/text').split('\n')[0].replace('interface ', '');
                    }).join(', ')}`;
                }
                code += ' {\n';
                
                // Ajouter les attributs
                attributes.forEach(attr => {
                    code += `    private $${attr.name};\n`;
                });
                
                code += '\n';
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    const returnType = method.returnType;
                    const existingClass = elements.find(el => el.attr('label/text').split('\n')[0] === returnType);
                    const finalReturnType = existingClass ? returnType : method.returnType;

                    code += `    public function ${method.name}() {\n`;
                    code += '        // TODO: implement this method\n';
                    code += '    }\n';
                });
                
                code += '}\n\n';
            }
        });

        return code;
    };

    const generatePythonCode = (graph) => {
        const elements = graph.getElements();
        const links = graph.getLinks();
        let code = '';

        const getInheritanceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'black' && link.attr('line/targetMarker/type') === 'path') {
                    const parentId = link.target().id;
                    const childId = link.source().id;
                    map.set(childId, parentId);
                }
            });
            return map;
        };

        const getInterfaceMap = (links) => {
            const map = new Map();
            links.forEach(link => {
                if (link.attr('line/stroke') === 'blue') {
                    const sourceId = link.source().id;
                    const targetId = link.target().id;
                    if (!map.has(targetId)) {
                        map.set(targetId, []);
                    }
                    map.get(targetId).push(sourceId);
                }
            });
            return map;
        };

        const inheritanceMap = getInheritanceMap(links);
        const interfaceMap = getInterfaceMap(links);

        elements.forEach((element) => {
            const className = element.attr('label/text').split('\n')[0];
            const attributes = JSON.parse(element.attr('attributes') || '[]');
            const methods = JSON.parse(element.attr('methods') || '[]');
            const parentClassId = inheritanceMap.get(element.id);
            const interfaces = interfaceMap.get(element.id) || [];

            if (className.startsWith('interface')) {
                code += `class ${className.replace('interface ', '')}:\n`;
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    code += `    def ${method.name}(self):\n`;
                    code += '        pass\n';
                });
                
                code += '\n';
            } else {
                code += `class ${className}`;
                if (parentClassId) {
                    const parentClassElement = elements.find(el => el.id === parentClassId);
                    const parentClassName = parentClassElement?.attr('label/text').split('\n')[0];
                    if (parentClassName) {
                        code += `(${parentClassName}`;
                        if (interfaces.length > 0) {
                            code += `, ${interfaces.map(id => {
                                const interfaceElement = elements.find(el => el.id === id);
                                return interfaceElement?.attr('label/text').split('\n')[0].replace('interface ', '');
                            }).join(', ')}`;
                        }
                        code += ')';
                    }
                } else if (interfaces.length > 0) {
                    code += `(${interfaces.map(id => {
                        const interfaceElement = elements.find(el => el.id === id);
                        return interfaceElement?.attr('label/text').split('\n')[0].replace('interface ', '');
                    }).join(', ')})`;
                }
                code += ':\n';
                
                // Ajouter les attributs
                attributes.forEach(attr => {
                    code += `    def __init__(self, ${attr.name}):\n`;
                    code += `        self.${attr.name} = ${attr.name}\n`;
                });
                
                code += '\n';
                
                // Ajouter les méthodes
                methods.forEach(method => {
                    const returnType = method.returnType;
                    const existingClass = elements.find(el => el.attr('label/text').split('\n')[0] === returnType);
                    const finalReturnType = existingClass ? returnType : method.returnType;

                    code += `    def ${method.name}(self):\n`;
                    code += '        # TODO: implement this method\n';
                    code += '        pass\n';
                });
                
                code += '\n';
            }
        });

        return code;
    };

    const downloadCode = (code, filename) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1>Editeur Diagramme de Classes </h1>
            <Toolbar onAddClass={addClass} />
            <button onClick={enableLinkMode} disabled={isLinkMode || isInheritanceMode}>
                Relier deux classes
            </button>
            <button onClick={enableInheritanceMode} disabled={isLinkMode || isInheritanceMode}>
                Héritage
            </button>
           
            <button onClick={handleGenerateCode}>
                Générer le Code Java
            </button>
            <button onClick={handleGeneratePHPCode}>
                Générer le Code PHP
            </button>
            <button onClick={handleGeneratePythonCode}>
                Générer le Code Python
            </button>
            
            <div 
                id="paper" 
                ref={paperRef}
                style={{ width: '1200px', height: '800px', border: '1px solid black' }}></div>

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
                        <option value="boolean">Float</option>
                        <option value="boolean">Date</option>


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
                <input type="text" value={multiplicitySource} onChange={(e) => setMultiplicitySource(e.target.value)} />
                <label>Cardinalité cible:</label>
                <input type="text" value={multiplicityTarget} onChange={(e) => setMultiplicityTarget(e.target.value)} />
                <div>
                    <button onClick={handleLinkSave}>Sauvegarder</button>
                    <button onClick={deleteLink}>Supprimer le lien</button>
                </div>
            </Modal>
        </div>
    );
};

export default Diagram;
