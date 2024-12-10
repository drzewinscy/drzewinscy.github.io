// src/components/Tree.tsx
import React, { useRef, useState, useEffect, MouseEvent } from 'react'
import Tree, { RenderCustomNodeElementFn } from 'react-d3-tree'
import { People } from '../person'
import { set, update } from '../firebase';

interface TreeProps {
    people: People;
}

interface TreeNode {
    personId: string;
    children?: TreeNode[];
}

interface HoveredEdge {
    parentId: string;
    childId: string;
}

const TreeComponent: React.FC<TreeProps> = ({ people }) => {
    const treeContainer = useRef<HTMLDivElement>(null);
    const [treeData, setTreeData] = useState<TreeNode | TreeNode[] | null>(null);
    const [hoveredEdge, setHoveredEdge] = useState<HoveredEdge | null>(null);
    const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    function buildNode(personId: string): TreeNode {
        const person = people.data[personId];
        const node: TreeNode = { personId: personId };
        if (person.children && person.children.length > 0) {
            node.children = person.children.map(childId => buildNode(childId));
        }
        return node;
    }

    function rebuildTree(peopleData: People) {
        if (peopleData.roots.length === 1) {
            const rootNode = buildNode(peopleData.roots[0]);
            setTreeData(rootNode);
        } else if (peopleData.roots.length > 1) {
            const rootNodes = peopleData.roots.map(rootId => buildNode(rootId));
            setTreeData(rootNodes);
        } else {
            setTreeData(null);
        }
    }

    useEffect(() => { rebuildTree(people); }, [people]);

    function handleAddChild(parentId: string) {
        const childName = prompt("Podaj imię dziecka:");
        if (!childName) return;
        const childSurname = prompt("Podaj nazwisko dziecka:");
        const childDateStart = prompt("Podaj datę urodzenia (może być pusta):");
        const childDateEnd = prompt("Podaj datę zgonu (może być pusta):");

        set(`/people/child_${Date.now()}`, {
            'name': childName,
            'surname': childSurname,
            'parentId': parentId,
            'orderId': Math.floor(Math.random() * 1000),
            'dateStart': childDateStart,
            'dateEnd': childDateEnd,
        });
    }

    function handleAddParent(childId: string) {
        const person = people.data[childId];
        const parentName = prompt("Podaj imię rodzica:");
        if (!parentName) return;
        const parentSurname = prompt("Podaj nazwisko rodzica:");
        const parentDateStart = prompt("Podaj datę urodzenia (może być pusta):");
        const parentDateEnd = prompt("Podaj datę zgonu (może być pusta):");

        const newKey = `parent_${Date.now()}`;

        person.parentId = newKey;

        update(`/people/`, {
            [newKey]: {
                'name': parentName,
                'surname': parentSurname,
                'orderId': Math.floor(Math.random() * 1000),
                'dateStart': parentDateStart,
                'dateEnd': parentDateEnd,
            },
            [childId]: { ...person },
        });
    }

    function handleEditPerson(personId: string) {
        const person = people.data[personId];
        const newName = prompt("Nowe imię:", person.name);
        if (!newName) return;
        person.name = newName;
        person.surname = prompt("Nowe nazwisko:", person.surname) ?? person.surname;
        person.dateStart = prompt("Podaj datę urodzenia (może być pusta):", person.dateStart) ?? person.dateStart;
        person.dateEnd = prompt("Podaj datę zgonu (może być pusta):", person.dateEnd) ?? person.dateEnd;
        person.description = prompt("Podaj opis (może być pusty):", person.description) ?? person.description;

        update(`/people/`, {
            [personId]: { ...person },
        });
    }

    const renderCustomNode: RenderCustomNodeElementFn = ({ nodeDatum }) => {
        const personId = (nodeDatum as any).personId as string;
        const person = people.data[personId];

        function moveLabel(): React.ReactNode {

            function moveright(personId: any) {
                const children = people.data[person.parentId!].children;
                const index = children.indexOf(personId);
                if (index == children.length - 2) {
                    set(`/people/${personId}/orderId`, people.data[children[children.length - 1]].orderId + 100)
                } else {
                    set(`/people/${personId}/orderId`, (people.data[children[index + 1]].orderId + people.data[children[index + 2]].orderId) / 2)
                }
            }

            function moveLeft(personId: string) {
                const children = people.data[person.parentId!].children;
                const index = children.indexOf(personId);
                if (index == 1) {
                    set(`/people/${personId}/orderId`, people.data[children[0]].orderId - 100)
                } else {
                    set(`/people/${personId}/orderId`, (people.data[children[index - 1]].orderId + people.data[children[index - 2]].orderId) / 2)
                }
            }

            return <div style={{
                display: 'flex',
                alignSelf: 'stretch',
                justifyContent: 'space-between',
                fontSize: '10px',
            }}>
                {people.data[person.parentId!].children.some(c => people.data[c].orderId < person.orderId) ?
                    <button onClick={(e) => { e.stopPropagation(); moveLeft(personId); }} style={{
                        backgroundColor: '#eee',
                        border: '1px solid #ccc',
                        padding: '0px 1px',
                        cursor: 'pointer',
                        color: 'black'
                    }}>
                        {'<'}
                    </button>
                    : <div style={{ width: 11 }} />}
                Przesuń
                {people.data[person.parentId!].children.some(c => people.data[c].orderId > person.orderId) ?
                    <button onClick={(e) => { e.stopPropagation(); moveright(personId); }} style={{
                        backgroundColor: '#eee',
                        border: '1px solid #ccc',
                        padding: '0px 1px',
                        cursor: 'pointer',
                        color: 'black'
                    }}>
                        {'>'}
                    </button>
                    : <div style={{ width: 11 }} />}
            </div>;
        }

        function buttons() {
            return <div style={{
                display: 'flex',
                gap: '2px',
                color: 'black',
                fontSize: '10px',
            }}>
                <button onClick={(e) => { e.stopPropagation(); handleEditPerson(personId); }} style={{
                    backgroundColor: '#eee',
                    border: '1px solid #ccc',
                    padding: '0px 1px',
                    cursor: 'pointer',
                    color: 'black',
                }}>
                    Edytuj
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleAddChild(personId); }} style={{
                    backgroundColor: '#eee',
                    border: '1px solid #ccc',
                    padding: '0px 1px',
                    cursor: 'pointer',
                    color: 'black',
                }}>
                    Dodaj dziecko
                </button>
                {!!!person.parentId && (
                    <button onClick={(e) => { e.stopPropagation(); handleAddParent(personId); }} style={{
                        backgroundColor: '#eee',
                        border: '1px solid #ccc',
                        padding: '0px 1px',
                        cursor: 'pointer',
                        color: 'black',
                    }}>
                        Dodaj rodzica
                    </button>
                )}
            </div>;
        }

        return (<g><foreignObject width={130} height={80} x={-64} y={-30}>
            <div onMouseEnter={() => setHoveredPerson(personId)} onMouseLeave={() => setHoveredPerson(null)} style={{
                backgroundColor: '#ccc',
                border: '1px solid gray',
                borderRadius: '4px',
                padding: '4px',
                cursor: 'default',
                textAlign: 'center',
                fontFamily: 'sans-serif',
                fontSize: '12px',
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
            }}>
                <div style={{ marginBottom: '4px', fontWeight: 'bold' }}>{person.name} {person.surname}</div>

                <div style={{ display: 'flex', alignSelf: 'center' }}>
                    {person.dateStart != '' && <div>★{person.dateStart}</div>}
                    {person.dateStart != '' && person.dateEnd != '' && <div style={{ width: 10 }} />}
                    {person.dateEnd != '' && <div>✝{person.dateEnd}</div>}
                </div>

                {buttons()}
                {people.data[person.parentId ?? '']?.children.length > 1 && moveLabel()}
            </div>
        </foreignObject></g>);
    };

    // Śledzenie pozycji myszy, aby tooltip pojawił się w miejscu kursora
    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    function pathClassFunc(): string {
        return 'thick-path';
    }

    return (
        <div ref={treeContainer} id="treeWrapper" onMouseMove={handleMouseMove} style={{
            width: '100%',
            display: 'flex',
            backgroundColor: '#fff1',
            position: 'relative',
            flex: 1,
        }}>
            {treeData && (
                <Tree
                    data={treeData as any}
                    orientation="vertical"
                    translate={{ x: (document.getElementById('root')?.clientWidth ?? 200) / 2, y: 100 }}
                    pathFunc="diagonal"
                    zoomable={true}
                    renderCustomNodeElement={renderCustomNode}
                    separation={{
                        siblings: 1,
                        nonSiblings: 1.3,
                    }}
                    onLinkMouseOver={(sourceNode, targetNode) => {
                        const parentId = (sourceNode.data as any).personId;
                        const childId = (targetNode.data as any).personId;
                        setHoveredEdge({ parentId, childId });
                    }}
                    onLinkMouseOut={() => setHoveredEdge(null)}
                    pathClassFunc={pathClassFunc}
                />
            )}
            {hoveredEdge && true && (
                <div style={{
                    position: 'absolute',
                    top: `${mousePos.y + 10}px`,
                    left: `${mousePos.x + 10}px`,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                }}>
                    to jest krawędź między {hoveredEdge.parentId} a {hoveredEdge.childId}
                </div>
            )}
            {hoveredPerson && people.data[hoveredPerson].description && (
                <div style={{
                    position: 'absolute',
                    top: `${mousePos.y + 20}px`,
                    left: `${mousePos.x + 10}px`,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    pointerEvents: 'none',
                    fontFamily: 'sans-serif',
                    fontSize: '12px'
                }}>
                    {people.data[hoveredPerson].description}
                </div>
            )}
        </div>
    );
}

export default TreeComponent
