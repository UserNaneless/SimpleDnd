import { useEffect, useState } from "react";
import Draggable from "../components/Draggable";
import DropZone from "../components/DropZone";

const SortableList = () => {

    const [items, setItems] = useState([1, 2, 3]);

    useEffect(() => {
        console.log(items)
    }, [items])

    return <DropZone onDrop={(item) => {
        setItems(i => [...i, item.data.value + 1]);
    }}>
        <div className="list" style={{
            background: "magenta",
            width: 400,
            height: 800,
            borderRadius: 12
        }}>
            {
                items.map(item => <Draggable key={item} data={{
                    value: item
                }}>
                    <div style={{
                        width: 100,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "cyan",
                        borderRadius: 12
                    }} className="list_item">
                        {item}
                    </div>
                </Draggable>
                )
            }
        </div>
    </DropZone>
}

export default SortableList;
