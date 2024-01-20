import { createContext, useEffect, useState } from "react"

export type DndItem = {
    id: string,
    element: HTMLDivElement,
    data: object
}

export type DndZone = {
    onDrop?: (val: DndItem) => void
    onOver?: (val: DndItem) => void
} & DndItem

type DndContextType = {
    draggable: DndItem[]
    dropzones: DndZone[]
    drag: boolean,
    drop: () => void,
    activeDragElement: DndItem | null,
    setActiveDragElement: (val: string) => void,
    removeActiveDragElement: () => void,
    addDraggable: (val: DndItem) => void,
    addDropzone: (val: DndZone) => void,
    removeDraggable: (id: string) => void,
    removeDropzone: (id: string) => void,
    updateDropzone: (val: DndZone) => void,
    setDrag: (val: boolean) => void,
    collideActiveWithItems: (val: DndItem) => void
}

const DndContext = createContext<DndContextType>({
    draggable: [],
    dropzones: [],
    drag: false,
    drop: () => { },
    activeDragElement: null,
    setActiveDragElement: () => { },
    removeActiveDragElement: () => { },
    addDraggable: () => { },
    addDropzone: () => { },
    removeDraggable: () => { },
    removeDropzone: () => { },
    updateDropzone: () => { },
    setDrag: () => { },
    collideActiveWithItems: () => { }
});

type DndContextProps = {
    children: React.ReactNode
}

const isCollision = (a: DndItem, b: DndItem) => {
    const aRect = a.element.getBoundingClientRect();
    const bRect = b.element.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

const CDndContext = ({ children }: DndContextProps) => {

    const [draggable, setDraggable] = useState<DndItem[]>([]);
    const [dropzones, setDropzones] = useState<DndZone[]>([]);
    const [activeDragElement, setActiveDragElement] = useState<DndItem | null>(null);
    const [drag, setDrag] = useState(false);

    const collideActiveWithItems = (val: DndItem) => {
        dropzones.forEach(zone => {
            if (isCollision(val, zone)) {
                zone?.onOver?.(val);
                if (zone.element.children[0].style.background === "magenta")
                    zone.element.children[0].style.background = "red";
            } else {
                zone.element.children[0].style.background = "magenta"
            }
        });

        draggable.forEach(item => {
            if (item.element != val.element && isCollision(val, item)) {
                if (item.element.children[0].style.background === "cyan")
                    item.element.children[0].style.background = "red";
            } else {
                item.element.children[0].style.background = "cyan"
            }
        })
    }

    useEffect(() => {
        console.log(draggable, dropzones, activeDragElement);
    }, [draggable, dropzones, activeDragElement])

    return <DndContext.Provider value={{
        draggable,
        dropzones,
        drag,
        drop: () => {
            if (activeDragElement) {
                for (let i = 0; i < dropzones.length; i++) {
                    const zone = dropzones[i];
                    if (isCollision(activeDragElement, zone)) {
                        zone?.onDrop?.(activeDragElement);
                        setActiveDragElement(null);
                        return;
                    }
                }

            }
        },
        activeDragElement,
        setActiveDragElement: (id) => {
            const elem = draggable.find(item => item.id === id);
            if (elem)
                setActiveDragElement(elem)
        },
        removeActiveDragElement: () => setActiveDragElement(null),
        addDraggable: val => setDraggable(list => [...list, val]),
        addDropzone: val => setDropzones(list => [...list, val]),
        removeDraggable: id => setDraggable(list => list.filter(item => item.id != id)),
        removeDropzone: id => setDropzones(list => list.filter(item => item.id != id)),
        updateDropzone: val => {
            setDropzones(list => list.map(item => item.id === val.id ? val : item))
        },
        setDrag,
        collideActiveWithItems
    }}>
        {children}
    </DndContext.Provider>
}

export {
    DndContext,
    CDndContext
}
