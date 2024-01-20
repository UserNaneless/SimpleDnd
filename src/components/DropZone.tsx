import { useContext, useEffect, useRef, useState } from "react"
import { DndContext, DndItem } from "./DndContext"

type DropZoneProps = {
    children: React.ReactNode,
    onDrop?: (item: DndItem) => void,
    onOver?: (item: DndItem) => void

}

const DropZone = ({ children, onDrop, onOver }: DropZoneProps) => {

    const dndContext = useContext(DndContext);
    const ref = useRef<HTMLDivElement | null>(null);
    const [dropzoneId] = useState("id" + Math.random().toString(16).slice(5));

    useEffect(() => {
        if (ref.current)
            dndContext.addDropzone({
                element: ref.current,
                data: {
                    dropzone: "zone"
                },
                onDrop,
                onOver,
                id: dropzoneId
            });

        return () => {

            if (ref.current)
                dndContext.removeDropzone(dropzoneId);
        }
    }, [])

    useEffect(() => {
        if (ref.current)
            dndContext.updateDropzone({
                element: ref.current,
                data: {
                    dropzone: "zone"
                },
                onDrop,
                onOver, 
                id: dropzoneId
            })
    }, [onDrop])

    return <div className="wrapper" style={{ width: "fit-content" }} ref={ref}>
        {children}
    </div>
}

export default DropZone;
