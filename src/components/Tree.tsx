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

        set(`/people/child_${Date.now()}`, {
            'name': childName,
            'surname': childSurname,
            'parentId': parentId,
            'orderId': Math.floor(Math.random() * 1000),
        });
    }

    function handleAddParent(childId: string) {
        const parentName = prompt("Podaj imię rodzica:");
        if (!parentName) return;
        const parentSurname = prompt("Podaj nazwisko rodzica:");

        const newKey = `parent_${Date.now()}`;

        update(`/people/`, {
            [newKey]: {
                'name': parentName,
                'surname': parentSurname,
                'orderId': Math.floor(Math.random() * 1000),
            },
            [`${childId}/parentId`]: newKey,
        });
    }

    function handleEditPerson(personId: string) {
        const person = people.data[personId];
        const newName = prompt("Nowe imię:", person.name);
        if (!newName) return;
        const newSurname = prompt("Nowe nazwisko:", person.surname);

        update(`/people/`, {
            [personId]: {
                'name': newName,
                'surname': newSurname,
                'parentId': person.parentId,
                'orderId': person.orderId,
            },
        });
    }

    const renderCustomNode: RenderCustomNodeElementFn = ({ nodeDatum }) => {
        const personId = (nodeDatum as any).personId as string;
        const person = people.data[personId];

        const hasParent = !!person.parentId;

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

        return (<g><foreignObject width={130} height={62} x={-64} y={-30}>
            <div style={{
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
                <div style={{
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
                    {!hasParent && (
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
                </div>
                {people.data[person.parentId ?? '']?.children.length > 1 &&
                    <div style={{
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
                            <button onClick={(e) => { e.stopPropagation(); moveright(personId) }} style={{
                                backgroundColor: '#eee',
                                border: '1px solid #ccc',
                                padding: '0px 1px',
                                cursor: 'pointer',
                                color: 'black'
                            }}>
                                {'>'}
                            </button>
                            : <div style={{ width: 11 }} />}
                    </div>
                }
            </div>
        </foreignObject></g >);
    };

    // Śledzenie pozycji myszy, aby tooltip pojawił się w miejscu kursora
    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    return (
        <div ref={treeContainer} id="treeWrapper" onMouseMove={handleMouseMove} style={{
            width: '100%',
            height: '600px',
            overflow: 'auto',
            backgroundColor: '#fff1',
            position: 'relative'
        }}>
            {treeData && (
                <Tree
                    data={treeData as any}
                    orientation="vertical"
                    translate={{ x: 400, y: 50 }}
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
                    onLinkMouseOut={() => {
                        setHoveredEdge(null);
                    }}
                // onLinkClick={(sourceNode, targetNode) => {
                // }}

                />
            )}
            {hoveredEdge && (
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
        </div>
    );
}

export default TreeComponent
