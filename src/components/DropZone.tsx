import { useContext, useEffect, useRef } from "react"
import { DndContext, DndItem } from "./DndContext"

type DropZoneProps = {
    children: React.ReactNode,
    onDrop: (item: DndItem) => void
}

const DropZone = ({ children, onDrop }: DropZoneProps) => {

    const dndContext = useContext(DndContext);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (ref.current)
            dndContext.addDropzone({
                element: ref.current,
                data: {
                    dropzone: "zone"
                },
                onDrop
            });

        return () => {

            if (ref.current)
                dndContext.removeDropzone({
                    element: ref.current,
                    data: {
                        dropzone: "zone"
                    },
                    onDrop
                });
        }
    }, [])

    useEffect(() => {
        if (ref.current)
            dndContext.updateDropzone({
                element: ref.current,
                data: {
                    dropzone: "zone"
                },
                onDrop
            })
    }, [onDrop])

    return <div className="wrapper" style={{ width: "fit-content" }} ref={ref}>
        {children}
    </div>
}

export default DropZone;
