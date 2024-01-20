import './App.css'
import { CDndContext } from './components/DndContext'
import Draggable from './components/Draggable'
import DropZone from './components/DropZone'

function App() {

    return (
        <>
            <CDndContext>
                <Draggable>
                    <div className="drag_div">
                        Drag me!
                    </div>
                </Draggable>

                <Draggable>
                    <div className="drag_div">
                        Drag me!
                    </div>
                </Draggable>

                <DropZone onDrop={(item) => {
                    console.log("Dropped: ", item);
                }}>
                    <div className="drop_div">
                        Drop here!
                    </div>
                </DropZone>
            </CDndContext>
        </>
    )
}

export default App
