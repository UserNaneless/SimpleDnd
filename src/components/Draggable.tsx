import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DndContext } from "./DndContext";

type DraggableProps = {
    children: React.ReactNode,
    data?: object
}

const Draggable = ({ children, data }: DraggableProps) => {

    const dndContext = useContext(DndContext);

    const [drag, setDrag] = useState(false);
    const [mouseRel, setMouseRel] = useState([0, 0]);
    const ref = useRef<HTMLDivElement | null>(null);
    const [draggableId] = useState("id" + Math.random().toString(16).slice(4));

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
                id: draggableId
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
        if (ref.current)
            if (drag) {
                ref.current.style.position = "fixed";

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
                const rect = ref.current.getBoundingClientRect();
                ref.current.style.left = rect.x + "px";
                ref.current.style.top = rect.y + "px";
                dndContext.drop();
                observer.disconnect();
                // ref.current.style.position = "relative";
            }
    }, [drag])

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
