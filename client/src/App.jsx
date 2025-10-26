import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/data')
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="App">
            <h1>Vite + React + Express</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <p>Server response: {data?.message}</p>
                    <p>Timestamp: {data?.timestamp}</p>
                </div>
            )}
        </div>
    )
}

export default App