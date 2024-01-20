import { createContext, useEffect, useState } from "react"

export type DndItem = {
    element: HTMLDivElement,
    data: object
}

export type DndZone = {
    onDrop: (val: DndItem) => void
} & DndItem

type DndContextType = {
    draggable: DndItem[]
    dropzones: DndZone[]
    drag: boolean,
    drop: () => void,
    activeDragElement: DndItem | null,
    setActiveDragElement: (val: DndItem) => void,
    removeActiveDragElement: () => void,
    addDraggable: (val: DndItem) => void,
    addDropzone: (val: DndZone) => void,
    removeDraggable: (val: DndItem) => void,
    removeDropzone: (val: DndZone) => void,
    updateDropzone: (val: DndZone) => void,
    setDrag: (val: boolean) => void,
    checkCollisions: (val: DndItem) => void
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
    checkCollisions: () => { }
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

    const checkCollisions = (val) => {
        dropzones.forEach(zone => {
            if (isCollision(val, zone)) {
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
                dropzones.forEach(zone => {
                    if (isCollision(activeDragElement, zone)) {
                        zone.onDrop(activeDragElement);
                    }

                })
            }
        },
        activeDragElement,
        setActiveDragElement: (val) => setActiveDragElement(val),
        removeActiveDragElement: () => setActiveDragElement(null),
        addDraggable: val => setDraggable(list => [...list, val]),
        addDropzone: val => setDropzones(list => [...list, val]),
        removeDraggable: val => setDraggable(list => list.filter(item => item.element != val.element)),
        removeDropzone: val => setDropzones(list => list.filter(item => item.element != val.element)),
        updateDropzone: val => {
            setDropzones(list => list.map(item => item.element === val.element ? val : item))
        },
        setDrag,
        checkCollisions
    }}>
        {children}
    </DndContext.Provider>
}

export {
    DndContext,
    CDndContext
}
