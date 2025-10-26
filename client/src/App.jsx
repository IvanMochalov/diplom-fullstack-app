import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [users, setUsers] = useState([])
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [serverReady, setServerReady] = useState(false)

    // Проверяем доступность сервера
    const checkServer = async () => {
        try {
            const response = await fetch('/api/users')
            if (response.ok) {
                setServerReady(true)
                fetchUsers()
            }
        } catch (error) {
            // Сервер еще не готов, пробуем снова через 1 секунду
            setTimeout(checkServer, 1000)
        }
    }

    // Получить всех пользователей
    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/users')
            const result = await response.json()
            setUsers(result)
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Создать пользователя
    const createUser = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            })

            if (response.ok) {
                const newUser = await response.json()
                setUsers([newUser, ...users])
                setName('')
                setEmail('')
            } else {
                const error = await response.json()
                alert(error.error)
            }
        } catch (error) {
            console.error('Error creating user:', error)
        }
    }

    useEffect(() => {
        // Ждем 2 секунды перед первой проверкой сервера
        const timer = setTimeout(checkServer, 2000)
        return () => clearTimeout(timer)
    }, [])

    if (!serverReady) {
        return (
            <div className="App">
                <h1>Vite + React + Express + SQLite</h1>
                <p>🔄 Waiting for server to start...</p>
            </div>
        )
    }

    return (
        <div className="App">
            <h1>Vite + React + Express + SQLite</h1>

            <form onSubmit={createUser} style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button type="submit">Add User</button>
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <h2>Users ({users.length})</h2>
                    {users.map(user => (
                        <div key={user.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '0.5rem 0' }}>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Posts:</strong> {user.posts?.length || 0}</p>
                            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default App