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

    const inheritanceMap = getInheritanceMap(links);

    elements.forEach((element) => {
        const className = element.attr('label/text').split('\n')[0];
        const attributes = JSON.parse(element.attr('attributes') || '[]');
        const methods = JSON.parse(element.attr('methods') || '[]');
        const parentClassId = inheritanceMap.get(element.id);

        code += `public class ${className}`;
        if (parentClassId) {
            const parentClassElement = elements.find(el => el.id === parentClassId);
            const parentClassName = parentClassElement?.attr('label/text').split('\n')[0];
            if (parentClassName) {
                code += ` extends ${parentClassName}`;
            }
        }
        code += ' {\n';
        
        // Ajouter les attributs
        attributes.forEach(attr => {
            code += `    private ${attr.type} ${attr.name};\n`;
        });
        
        code += '\n';
        
        // Ajouter les méthodes
        methods.forEach(method => {
            code += `    public ${method.returnType} ${method.name}() {\n`;
            code += '        // G5\n';
            code += '    }\n';
        });
        
        code += '}\n\n';
    });

    console.log(code);
    alert(code);
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
        <button onClick={handleGenerateCode}>
            Générer le Code Java
        </button>
        <div 
            id="paper" 
            ref={paperRef}
            style={{ width: '800px', height: '600px', border: '1px solid black' }}></div>

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


export default Diagram;
