import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [temperatures, setTemperatures] = useState([])
    const [selectedDate, setSelectedDate] = useState('')
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)

    // Устанавливаем вчерашнюю дату по умолчанию
    useEffect(() => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        setSelectedDate(yesterday.toISOString().split('T')[0])
    }, [])

    // Получить температуру за выбранный день
    const fetchTemperatures = async (date) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/temperatures/${date}`)
            const result = await response.json()
            setTemperatures(result.data || [])

            // Также получаем статистику
            const statsResponse = await fetch(`/api/stats/${date}`)
            if (statsResponse.ok) {
                const statsData = await statsResponse.json()
                setStats(statsData)
            }
        } catch (error) {
            console.error('Error fetching temperatures:', error)
            setTemperatures([])
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    // Добавить новое измерение
    const addTemperature = async () => {
        const value = 40 + Math.random() * 20 // случайная температура
        try {
            await fetch('/api/temperatures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: parseFloat(value.toFixed(1)) }),
            })
            // Обновляем данные
            fetchTemperatures(selectedDate)
        } catch (error) {
            console.error('Error adding temperature:', error)
        }
    }

    useEffect(() => {
        if (selectedDate) {
            fetchTemperatures(selectedDate)
        }
    }, [selectedDate])

    return (
        <div className="App">
            <h1>🌡️ Temperature Monitor</h1>

            {/* Выбор даты */}
            <div style={{ marginBottom: '2rem' }}>
                <label>
                    Select Date:
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ marginLeft: '1rem', padding: '0.5rem' }}
                    />
                </label>

                <button
                    onClick={addTemperature}
                    style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
                >
                    Add Random Temperature
                </button>
            </div>

            {/* Статистика */}
            {stats && (
                <div style={{
                    border: '1px solid #ccc',
                    padding: '1rem',
                    marginBottom: '2rem',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h3>📊 Statistics for {stats.date}</h3>
                    <p><strong>Records:</strong> {stats.count}</p>
                    <p><strong>Average:</strong> {stats.average}°C</p>
                    <p><strong>Min:</strong> {stats.min}°C</p>
                    <p><strong>Max:</strong> {stats.max}°C</p>
                </div>
            )}

            {/* Список температур */}
            {loading ? (
                <p>Loading temperatures...</p>
            ) : (
                <div>
                    <h3>📈 Temperature Data ({temperatures.length} records)</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {temperatures.map(temp => (
                            <div key={temp.id} style={{
                                border: '1px solid #eee',
                                padding: '0.5rem',
                                margin: '0.25rem 0',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                <span>
                  {new Date(temp.timestamp).toLocaleTimeString()}
                </span>
                                <span style={{
                                    fontWeight: 'bold',
                                    color: temp.value > 55 ? 'red' : temp.value < 45 ? 'blue' : 'green'
                                }}>
                  {temp.value}°C
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App