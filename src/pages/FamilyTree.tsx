// src/pages/FamilyTree.tsx
import React, { useEffect, useState } from 'react'
import { onValue } from '../firebase'
import TreeComponent from '../components/Tree'
import { People } from '../person'

const FamilyTree: React.FC = () => {
    const [people, setPeople] = useState<People | null>(null)

    useEffect(() => {
        onValue('/people/', (snapshot) => {
            const data = snapshot.val()
            if (!data) return;
            setPeople(new People(data))
        })
    }, [])

    return (
        <div>
            <h3 style={{ margin: 0 }}>Drzewo Genealogiczne</h3>
            {people ? <TreeComponent people={people} /> : null}
        </div>
    )
}

export default FamilyTree