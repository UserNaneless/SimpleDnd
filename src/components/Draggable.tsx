import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, DndItem } from "./DndContext";

type StartStyles = {
    width: string,
    height: string,
    position: string
}

type DraggableProps = {
    children: React.ReactNode,
    data?: object,
    onOver?: (itemOver: DndItem, dragItem: DndItem, others: DndItem[]) => void,
    onDrop?: (dragItem: DndItem, others: DndItem[]) => void,
    reset?: (cur: HTMLDivElement) => void,
}

const Draggable = ({ children, data, onOver, onDrop, reset }: DraggableProps) => {

    const dndContext = useContext(DndContext);

    const [drag, setDrag] = useState(false);
    const [mouseRel, setMouseRel] = useState([0, 0]);
    const ref = useRef<HTMLDivElement | null>(null);
    const [draggableId] = useState("id" + Math.random().toString(16).slice(4));
    const [startStyles, setStartStyles] = useState<StartStyles>();

    const dragFunc = (e: MouseEvent) => {
        const elem = ref.current;
        if (elem) {
            elem.style.left = e.clientX - mouseRel[0] + "px";
            elem.style.top = e.clientY - mouseRel[1] + "px";
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
            dndContext.updateDraggable(
                {
                    element: ref.current,
                    data: data || {},
                    id: draggableId,
                    onOver,
                    onDrop
                });
        }
    }, [data, onOver]);

    useEffect(() => {
        if (ref.current)
            if (drag) {
                dndContext.setDrag(true);
                setStartStyles({
                    width: ref.current.style.width,
                    height: ref.current.style.height,
                    position: ref.current.style.position
                });
                const rect = ref.current.getBoundingClientRect();
                ref.current.style.width = rect.width + "px";
                ref.current.style.position = "fixed";
                ref.current.style.zIndex = 10000;

                dndContext.setActiveDragElement(draggableId);

                const dragFuncToAssign = (e: MouseEvent) => {
                    dragFunc(e);
                }

                const clearDrag = () => {
                    setDrag(false);
                    window.removeEventListener("mousemove", dragFuncToAssign);
                    window.removeEventListener("mouseup", clearDrag);
                }
                window.addEventListener("mousemove", dragFuncToAssign);
                window.addEventListener("mouseup", clearDrag);

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
                    ref.current.style.zIndex = 0;
                    Object.keys(startStyles).forEach(key => {
                        ref.current.style[key] = startStyles[key];
                    });
                }
                // ref.current.style.position = "relative";
            }
    }, [drag])

    useEffect(() => {
        if (ref.current)
            reset?.(ref.current);
    }, [dndContext.drag])

    return <div ref={ref} className="wrapper" style={{
        width: "fit-content"
    }} onMouseDown={(e) => {
        setDrag(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setMouseRel([
            e.clientX - rect.x,
            e.clientY - rect.y
        ]);

        e.currentTarget.style.left = rect.x + "px";
        e.currentTarget.style.top = rect.y + "px";

    }}>
        {children}
    </div>
}

export default Draggable;
