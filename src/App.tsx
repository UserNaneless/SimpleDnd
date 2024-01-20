import './App.css'
import { CDndContext } from './components/DndContext'
import SortableList from './sortable/SortableList'

function App() {

    return (
        <>
            <CDndContext>

                <SortableList />


            </CDndContext>
        </>
    )
}

export default App
