import { useEffect, useState } from "react";
import Draggable from "../components/Draggable";
import DropZone from "../components/DropZone";
import { DndItem } from "../components/DndContext";

const THRESHOLD = 5;

const isCollision = (a: DndItem, b: DndItem, lastItem: boolean) => {
    const aRect = a.element.getBoundingClientRect();
    const bRect = b.element.getBoundingClientRect();

    const bTransform = b.element.style.transform;
    let y = 0;
    let lastHelper = 0;

    if (!bTransform.includes("(0)")) {
        const computed = window.getComputedStyle(b.element).transform.split(",");
        y = Number(computed[computed.length - 1].slice(0, computed.indexOf(")")));

    }

    if (lastItem) {
        lastHelper += 50;
        y = 0
    }
    return !(
        ((aRect.top + aRect.height - THRESHOLD) < (bRect.top - y)) ||
        (aRect.top > (bRect.top - y + bRect.height + lastHelper - THRESHOLD)) ||
        ((aRect.left + aRect.width - THRESHOLD) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width - THRESHOLD))
    );
}

const SortableList = () => {

    const [items, setItems] = useState([1, 2, 3, 4, 5, 6]);
    // const [potentialPlace, setPotentialPlace] = useState(0);

    return <DropZone onDrop={(zone, item, over, others) => {
        setItems(i => {
            let copy = [...i];
            /* console.log(potentialPlace);
            if (potentialPlace === items.length - 1) {
                const zoneRect = zone.element.getBoundingClientRect();
                const itemRect = item.element.getBoundingClientRect();
                if (zoneRect.y + zoneRect.height > itemRect.y) {
                    return [...copy.filter(fItem => fItem != item.data.value), item.data.value];
                }
            }
            console.log(item.data.index);

            const slice = copy.slice(potentialPlace).filter(fItem => fItem != item.data.value);
            console.log("Slice: ", slice);
            copy.splice(potentialPlace);
            copy = copy.filter(fItem => fItem != item.data.value)
            console.log("Splice: ", copy);
            copy.push(item.data.value);
            console.log("Push", copy);
            return [...copy, ...slice]; */
            if (over) {
                const slice = copy.slice(over.data.index).filter(fItem => fItem != item.data.value);
                copy.splice(over.data.index);
                copy = copy.filter(fItem => fItem != item.data.value)
                copy.push(item.data.value);
                return [...copy, ...slice];
            }
            for (let j = 0; j < items.length; j++) {
                const other = others.find(fItem => fItem.data.index === j);
                if (other) {
                    if (isCollision(item, other, false)) {
                        const slice = copy.slice(other.data.index).filter(fItem => fItem != item.data.value);
                        copy.splice(other.data.index);
                        copy = copy.filter(fItem => fItem != item.data.value)
                        copy.push(item.data.value);
                        return [...copy, ...slice];
                    }

                    if (j === items.length - 1) {
                        const zoneRect = zone.element.getBoundingClientRect();
                        const itemRect = item.element.getBoundingClientRect();
                        if (isCollision(item, other, true) || zoneRect.y + zoneRect.height > itemRect.y) {
                            return [...copy.filter(fItem => fItem != item.data.value), item.data.value];
                        }
                    }
                }
            }
            return copy
        });
    }}>
        <div className="list" style={{
            background: "magenta",
            width: 400,
            height: 400,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyItems: "center",
            padding: "12px 0"
        }}>
            {
                items.map((item, i) => <Draggable key={item}

                    onDragStart={(curr, _, others) => {
                        others.forEach(other => {
                            const currRect = curr.element.getBoundingClientRect();
                            other.element.style.transition = "transform 0s";
                            const otherRect = other.element.getBoundingClientRect();
                            if (otherRect.y + otherRect.height / 2 >= currRect.y) {
                                other.element.style.transform = "translateY(50px)";
                            }
                        });
                        if (curr.shadowElement) {
                            const shadow = curr.shadowElement;
                            shadow.style.transform = "translateY(" + curr.data.index * 50 + "px)";
                            shadow.style.opacity = ".4";
                        }
                    }}

                    onDrop={(_, others) => {
                        others.forEach(other => {
                            other.element.style.transform = "translateY(0)";
                            other.element.style.transition = "transform 0s";
                        })

                    }}

                    reset={(elem) => {
                        elem.style.transform = "translateY(0)";
                        // elem.style.transition = "transform 0s";
                        // elem.children[0].style.background = "cyan";
                    }}

                    onOver={(_, curr, others) => {
                        const currRect = curr.element.getBoundingClientRect();
                        let higherThan = items.length - 1;
                        others.forEach(other => {
                            other.element.style.transition = "transform .2s";
                            const otherRect = other.element.getBoundingClientRect();
                            if (otherRect.y + otherRect.height / 2 >= currRect.y) {
                                other.element.style.transform = "translateY(50px)";
                                higherThan--;
                            }
                            else
                                other.element.style.transform = "translateY(0)";
                        });
                        if (curr.shadowElement) {
                            const shadow = curr.shadowElement;
                            shadow.style.transform = "translateY(" + higherThan * 50 + "px)";
                            shadow.style.opacity = ".4";
                        }
                    }}

                    data={{
                        value: item,
                        index: i
                    }}>
                    {
                        (dragStart) => {
                            return <div style={{
                                width: 300,
                                height: 50,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-around",
                                background: "cyan",
                                borderRadius: 12,
                            }} className="list_item">
                                {item}
                                <div onMouseDown={dragStart} onTouchStart={dragStart} className="dragger">
                                    |-|
                                </div>
                            </div>
                        }
                    }
                </Draggable>
                )
            }
        </div>
    </DropZone>
}

export default SortableList;
