import { createContext, useEffect, useState } from "react"

export type DndItem = {
    id: string,
    element: HTMLDivElement,
    data: {
        [x: string]: any
    },
    onOver?: (overItem: DndItem, dragItem: DndItem, others: DndItem[]) => void,
    onDrop?: (dragItem: DndItem, other: DndItem[]) => void
}

export type DndZone = {
    onDrop?: (dropzone: DndZone, val: DndItem, overItem: DndItem | null, other: DndItem[]) => void
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
    updateDraggable: (val: DndItem) => void,
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
    updateDraggable: () => { },
    updateDropzone: () => { },
    setDrag: () => { },
    collideActiveWithItems: () => { }
});

type DndContextProps = {
    children: React.ReactNode
}

const THRESHOLD = 15;

const isCollision = (a: DndItem, b: DndItem) => {
    const aRect = a.element.getBoundingClientRect();
    const bRect = b.element.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - THRESHOLD) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height - THRESHOLD)) ||
        ((aRect.left + aRect.width - THRESHOLD) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width - THRESHOLD))
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
            }
        });

        for (let i = 0; i < draggable.length; i++) {
            const item = draggable[i];
            if (item.id != val.id && isCollision(val, item)) {
                item?.onOver?.(item, val, draggable.filter(fItem => fItem.id != val.id));
                return;
            }
        }
    }

    useEffect(() => {
        // console.log(draggable, dropzones, activeDragElement);
    }, [draggable, dropzones, activeDragElement])

    return <DndContext.Provider value={{
        draggable,
        dropzones,
        drag,
        drop: () => {
            if (activeDragElement) {
                activeDragElement.onDrop?.(activeDragElement, draggable.filter(fItem => fItem.id != activeDragElement.id));
                for (let i = 0; i < dropzones.length; i++) {
                    const zone = dropzones[i];
                    if (isCollision(activeDragElement, zone)) {
                        const overElement = draggable.find(item =>
                            isCollision(item, activeDragElement) && item.id != activeDragElement.id) || null
                        zone?.onDrop?.(zone, activeDragElement, overElement, draggable.filter(item => item.id != activeDragElement.id && item.id != overElement?.id));
                        setActiveDragElement(null);
                        setDrag(false);
                        return;
                    }
                }

                setActiveDragElement(null);
                setDrag(false);
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
        updateDraggable: val => {
            setDraggable(list => list.map(item => item.id === val.id ? val : item))
        },
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
