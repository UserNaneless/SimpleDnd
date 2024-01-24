import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DndItem } from "./DndContext";

type StartStyles = {
    width: string,
    height: string,
    position: string,
    [x: string]: string
}

type DraggableProps = {
    children: React.ReactNode | ((dragStart: (e: React.TouchEvent | React.MouseEvent) => void) => React.ReactNode),
    data?: object,
    onOver?: (itemOver: DndItem, dragItem: DndItem, others: DndItem[]) => void,
    onDrop?: (dragItem: DndItem, others: DndItem[]) => void,
    onDragStart?: (dragItem: DndItem, shadowItem: HTMLDivElement | null, others: DndItem[]) => void
    reset?: (cur: HTMLDivElement) => void,
}

const getCoords = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    let [x, y] = [0, 0];
    if ("touches" in e) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.clientX;
        y = e.clientY;
    }
    return [x, y];
}

const Draggable = ({ children, data, onOver, onDrop, onDragStart, reset }: DraggableProps) => {

    const dndContext = useContext(DndContext);

    const [drag, setDrag] = useState(false);
    const [mouseRel, setMouseRel] = useState([0, 0]);
    const ref = useRef<HTMLDivElement | null>(null);
    const shadowRef = useRef<HTMLDivElement | null>(null);
    const [draggableId] = useState("id" + Math.random().toString(16).slice(4));
    const [startStyles, setStartStyles] = useState<StartStyles>();

    console.log("Man is rerendering")

    const dragStart = (e: React.TouchEvent | React.MouseEvent) => {
        setDrag(true);
        const elem = ref.current;
        if (elem) {
            const rect = elem.getBoundingClientRect();
            const [x, y] = getCoords(e);
            setMouseRel([
                x - rect.x,
                y - rect.y
            ]);

            elem.style.left = rect.x + "px";
            elem.style.top = rect.y + "px";
        }
    }

    const dragFunc = (e: MouseEvent | TouchEvent) => {
        const elem = ref.current;
        if (elem) {
            const [x, y] = getCoords(e);
            elem.style.left = x - mouseRel[0] + "px";
            elem.style.top = y - mouseRel[1] + "px";
        }
    }

    const observer = useMemo(() => {
        return new MutationObserver((entries, obs) => {
            if (!dndContext.activeDragElement) obs.disconnect();
            const item = entries.find(item => item.attributeName === "style");
            if (item) {
                if (ref.current && ref.current === dndContext.activeDragElement?.element)
                    dndContext.collideActiveWithItems(dndContext.activeDragElement);

            }
            return;
        });
    }, [dndContext.activeDragElement])

    useEffect(() => {
        if (ref.current)
            dndContext.addDraggable({
                element: ref.current,
                shadowElement: shadowRef.current,
                dragBeginRect: ref.current.getBoundingClientRect(),
                data: data || {},
                id: draggableId,
                onOver,
                onDrop
            });
        return () => {
            observer.disconnect();
            dndContext.removeDraggable(draggableId);
        }
    }, [])

    useEffect(() => {
        if (ref.current)
            observer.observe(ref.current, {
                attributes: true
            });
    }, [observer])

    useEffect(() => {
        if (data && onOver && ref.current) {
            dndContext.updateDraggable(draggableId,
                {
                    data: data || {},
                    onOver,
                    onDrop
                });
        }
    }, [data, onOver, onDrop]);

    useEffect(() => {
        if (ref.current)
            if (drag) {
                dndContext.setDrag(true);
                shadowRef.current!.style.display = "block";
                onDragStart?.({
                    element: ref.current,
                    shadowElement: shadowRef.current,
                    dragBeginRect: ref.current.getBoundingClientRect(),
                    data: data || {},
                    id: draggableId,
                    onOver,
                    onDrop
                }, shadowRef.current, dndContext.draggable.filter(fItem => fItem.id != draggableId));
                setStartStyles({
                    width: ref.current.style.width,
                    height: ref.current.style.height,
                    position: ref.current.style.position
                });
                const rect = ref.current.getBoundingClientRect();
                ref.current.style.width = rect.width + "px";
                ref.current.style.position = "fixed";
                ref.current.style.zIndex = "10000";

                dndContext.setActiveDragElement(draggableId);

                const dragFuncToAssign = (e: MouseEvent | TouchEvent) => {
                    e.preventDefault();
                    dragFunc(e);
                }

                const clearDrag = () => {
                    setDrag(false);
                    window.removeEventListener("mousemove", dragFuncToAssign);
                    window.removeEventListener("touchmove", dragFuncToAssign);
                    window.removeEventListener("mouseup", clearDrag);
                    window.removeEventListener("touchend", clearDrag);
                }
                window.addEventListener("mousemove", dragFuncToAssign, { passive: false });
                window.addEventListener("touchmove", dragFuncToAssign), { passive: false };
                window.addEventListener("mouseup", clearDrag);
                window.addEventListener("touchend", clearDrag);

                observer.observe(ref.current, {
                    attributes: true
                });
            } else {
                dndContext.drop();
                observer.disconnect();
                if (startStyles) {
                    const rect = ref.current.getBoundingClientRect();
                    ref.current.style.left = rect.x + "px";
                    ref.current.style.top = rect.y + "px";
                    ref.current.style.zIndex = "0";
                    Object.keys(startStyles).forEach(key => {
                        const styles = ref.current?.style as unknown as { [x: string]: string };
                        styles[key] = startStyles[key];
                    });
                }
                shadowRef.current!.style.display = "none";
                // ref.current.style.position = "relative";
            }
    }, [drag])

    useEffect(() => {
        if (ref.current) {
            if (dndContext.drag)
                if (dndContext.drag) {
                    dndContext.updateDraggable(draggableId, {
                        dragBeginRect: ref.current.getBoundingClientRect()
                    });
                }
                else
                    reset?.(ref.current);
        }
    }, [dndContext.drag])

    return <>
        <div ref={ref} className="wrapper" style={{
            width: "fit-content"
        }}

            onTouchStart={e => {
                if (typeof children !== "function")
                    dragStart(e);
            }}

            onMouseDown={(e) => {
                if (typeof children !== "function")
                    dragStart(e);
            }}>
            {
                (typeof children === "function") ?
                    children(dragStart) :
                    children
            }
        </div>
        <div ref={shadowRef} className="wrapper" style={{
            width: "fit-content",
            transition: "transform .2s",
            position: "fixed",
            zIndex: 1,
            display: drag ? "block" : "none"
        }}>
            {
                (typeof children === "function") ?
                    children(dragStart) :
                    children
            }
        </div>
    </>
}

export default Draggable;
