import { useContext, useEffect, useRef, useState } from "react"
import { DndContext, DndItem, DndZone } from "./DndContext"

type DropZoneProps = {
    children: React.ReactNode,
    onDrop?: (dropzone: DndZone, item: DndItem, overItem: DndItem | null, others: DndItem[]) => void,
    onOver?: (item: DndItem) => void,
    onEnter?: (zone: DndZone, item: DndItem) => void,
    onLeave?: (zone: DndZone, item: DndItem) => void,
    data?: object
}

const DropZone = ({ children, onDrop, onOver, onEnter, onLeave, data }: DropZoneProps) => {

    const dndContext = useContext(DndContext);
    const ref = useRef<HTMLDivElement | null>(null);
    const [dropzoneId] = useState("id" + Math.random().toString(16).slice(5));

    useEffect(() => {
        if (ref.current)
            dndContext.addDropzone({
                element: ref.current,
                dragBeginRect: ref.current.getBoundingClientRect(),
                data: data || {},
                onDrop,
                onOver,
                onEnter,
                onLeave,
                id: dropzoneId
            });

        return () => {

            if (ref.current)
                dndContext.removeDropzone(dropzoneId);
        }
    }, [])

    useEffect(() => {
        if (ref.current)
            dndContext.updateDropzone(dropzoneId, {
                onDrop,
                onOver,
                onLeave,
                onEnter,
                data: data || {}
            })
    }, [onDrop, onOver, onLeave, onEnter, data])

    return <div className="wrapper" style={{ width: "fit-content" }} ref={ref}>
        {children}
    </div>
}

export default DropZone;
