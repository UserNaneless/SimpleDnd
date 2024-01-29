import { createContext, useEffect, useState } from "react"

export type DndItem = {
    id: string,
    element: HTMLDivElement,
    shadowElement: HTMLDivElement | null,
    dragBeginRect: DOMRect,
    data: {
        [x: string]: any
    },
    onOver?: (overItem: DndItem, dragItem: DndItem, others: DndItem[]) => void,
    onDrop?: (dragItem: DndItem, other: DndItem[]) => void,
    onEnter?: (to: DndItem) => void,
    onLeave?: (from: DndItem) => void,
    itemsInside: string[]
}

export type DndItemUpdater = Partial<DndItem>;

export type DndZone = {
    onDrop?: (dropzone: DndZone, item: DndItem, overItem: DndItem | null, other: DndItem[]) => void
    onOver?: (val: DndItem) => void,
    onEnter?: (zone: DndZone, item: DndItem) => void,
    onLeave?: (zone: DndZone, item: DndItem) => void,
} & Omit<DndItem, "onDrop" | "onOver" | "shadowElement" | "onEnter" | "onLeave">

export type DndZoneUpdater = Partial<Omit<DndZone, "itemsInside">>;

type DndContextType = {
    draggable: DndItem[]
    dropzones: DndZone[]
    drag: boolean,
    drop: () => void,
    activeDragElement: DndItem | null,
    setActiveDragElement: (val: string) => void,
    removeActiveDragElement: () => void,
    addDraggable: (val: Omit<DndItem, "itemsInside">) => void,
    addDropzone: (val: Omit<DndZone, "itemsInside">) => void,
    removeDraggable: (id: string) => void,
    removeDropzone: (id: string) => void,
    updateDraggable: (id: string, val: DndItemUpdater) => void,
    updateDropzone: (id: string, val: DndZoneUpdater) => void,
    setDrag: (val: boolean) => void,
    collideActiveWithItems: () => void
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
    children: React.ReactNode,
    useRectsBeforeDrag?: boolean
}

const THRESHOLD = 5;

const isCollisionWithParam = (a: DndItem, b: DndItem | DndZone, useBeginRects?: boolean) => {
    const aRect = a.element.getBoundingClientRect();
    const bRect = useBeginRects ? b.dragBeginRect : b.element.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - THRESHOLD) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height - THRESHOLD)) ||
        ((aRect.left + aRect.width - THRESHOLD) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width - THRESHOLD))
    );
}

const CDndContext = ({ children, useRectsBeforeDrag }: DndContextProps) => {

    const isCollision = (a: DndItem, b: DndItem | DndZone) => isCollisionWithParam(a, b, useRectsBeforeDrag);

    const [draggable, setDraggable] = useState<DndItem[]>([]);
    const [dropzones, setDropzones] = useState<DndZone[]>([]);
    const [activeDragElement, setActiveDragElement] = useState<DndItem | null>(null);
    const [drag, setDrag] = useState(false);

    const collideActiveWithItems = (val: DndItem | null) => {
        if (!val) return;
        dropzones.forEach(zone => {
            if (isCollision(val, zone)) {
                if (!zone.itemsInside.includes(val.id)) {
                    setDropzones(zones => {
                        return zones.map(i => {
                            if (zone.id != i.id) {
                                return i;
                            }

                            return {
                                ...i,
                                itemsInside: [...i.itemsInside, val.id]
                            }
                        })
                    })

                    zone.onEnter?.(zone);
                }
                zone?.onOver?.(val);
            } else {
                if (zone.itemsInside.includes(val.id)) {
                    setDropzones(zones => {
                        return zones.map(i => {
                            if (zone.id != i.id) {
                                return i;
                            }

                            return {
                                ...i,
                                itemsInside: i.itemsInside.filter(id => id != val.id)
                            }
                        })
                    })

                    zone.onLeave?.(zone);
                }
            }
        });

        let overItemOvered = false;

        for (let i = 0; i < draggable.length; i++) {
            const item = draggable[i];
            if (item.id != val.id && isCollision(val, item)) {

                if (!item.itemsInside.includes(val.id)) {
                    setDraggable(drgs => {
                        return drgs.map(i => {

                            if (i.id != item.id)
                                return i
                            return {
                                ...i,
                                itemsInside: [...i.itemsInside, val.id]
                            }
                        })
                    });
                    item.onEnter?.(item);
                }

                if (!overItemOvered) {
                    item?.onOver?.(item, val, draggable.filter(fItem => fItem.id != val.id));
                    overItemOvered = true;
                }
            } else {
                if (item.itemsInside.includes(val.id)) {
                    setDraggable(drgs => drgs.map(i => {
                        if (i.id != item.id)
                            return i

                        return {
                            ...i,
                            itemsInside: i.itemsInside.filter(i => i != val.id)
                        }
                    }));
                    item.onLeave?.(item);
                }
            }
        }
    }

    useEffect(() => {
        setDropzones(zones => {
            return zones.map(zone => {
                return {
                    ...zone,
                    itemsInside: draggable.filter(item => isCollision(item, zone)).map(i => i.id)
                }
            })
        })
    }, [draggable])

    return <DndContext.Provider value={{
        draggable,
        dropzones,
        drag,
        drop: () => {
            if (activeDragElement) {
                for (let i = 0; i < dropzones.length; i++) {
                    const zone = dropzones[i];
                    if (isCollision(activeDragElement, zone)) {
                        const overElement = draggable.find(item =>
                            isCollision(activeDragElement, item) && item.id != activeDragElement.id) || null
                        zone?.onDrop?.(zone, activeDragElement, overElement, draggable.filter(item => item.id != activeDragElement.id && item.id != overElement?.id));
                        activeDragElement.onDrop?.(activeDragElement, draggable.filter(fItem => fItem.id != activeDragElement.id));
                        setActiveDragElement(null);
                        setDrag(false);
                        return;
                    }
                }

                activeDragElement.onDrop?.(activeDragElement, draggable.filter(fItem => fItem.id != activeDragElement.id));
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
        addDraggable: val => setDraggable(list => [...list, {
            ...val,
            itemsInside: []
        }]),
        addDropzone: val => setDropzones(list => [...list, {
            ...val,
            itemsInside: []
        }]),
        removeDraggable: id => setDraggable(list => list.filter(item => item.id != id)),
        removeDropzone: id => setDropzones(list => list.filter(item => item.id != id)),
        updateDraggable: (id, data) => {
            setDraggable(list => list.map(item => item.id === id ? {
                ...item,
                ...data
            } : item))
        },
        updateDropzone: (id, data) => {
            setDropzones(zone => zone.map(item => item.id === id ? {
                ...item,
                ...data
            } : item))
        },
        setDrag,
        collideActiveWithItems: () => collideActiveWithItems(activeDragElement)
    }}>
        {children}
    </DndContext.Provider>
}

export {
    DndContext,
    CDndContext
}
