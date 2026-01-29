import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTodos(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch todos. Make sure the server is running!');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding for first day of week (0 = Sunday, 1 = Monday...)
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // Add new todo
  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await axios.post(API_URL, {
        title: input,
        completed: false,
        dueDate: dueDate || null
      });
      setTodos([response.data, ...todos]);
      setInput('');
      setDueDate('');
      setError('');
    } catch (err) {
      setError('Failed to add todo');
      console.error('Error adding todo:', err);
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        completed: !completed
      });
      setTodos(todos.map(todo =>
        todo._id === id ? response.data : todo
      ));
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
    }
  };

  // Start editing
  const startEdit = (id, currentText, currentDate) => {
    setEditingId(id);
    setEditText(currentText);
    setEditDate(currentDate ? currentDate.substring(0, 16) : '');
  };

  // Save edit
  const saveEdit = async (id) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        title: editText,
        dueDate: editDate || null
      });
      setTodos(todos.map(todo =>
        todo._id === id ? response.data : todo
      ));
      setEditingId(null);
      setEditText('');
      setEditDate('');
      setError('');
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDate('');
  };

  const calendarDays = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading todos...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>ProTask</h1>
        <p className="subtitle">Manage your workflow with precision and style.</p>
      </header>

      <div className="view-switcher">
        <button
          className={view === 'list' ? 'active' : ''}
          onClick={() => { setView('list'); setSelectedDate(null); }}
        >
          Overview
        </button>
        <button
          className={view === 'calendar' ? 'active' : ''}
          onClick={() => setView('calendar')}
        >
          Calendar
        </button>
      </div>

      <div className="main-content">
        {error && <div className="error">{error}</div>}

        <form onSubmit={addTodo} className="todo-form">
          <div className="form-inputs">
            <input
              type="text"
              className="todo-input"
              placeholder="What's the next objective?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              type="datetime-local"
              className="date-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <button type="submit" className="add-btn">
            Create Task
          </button>
        </form>

        {view === 'list' ? (
          todos.length === 0 ? (
            <div className="empty-state">
              No todos yet. Add one above! 🚀
            </div>
          ) : (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li key={todo._id} className={`todo-item ${editingId === todo._id ? 'editing' : ''}`}>
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo._id, todo.completed)}
                  />

                  {editingId === todo._id ? (
                    <>
                      <div className="edit-container">
                        <input
                          type="text"
                          className="edit-input"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <input
                          type="datetime-local"
                          className="edit-date-input"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                      </div>
                      <div className="todo-actions">
                        <button
                          className="save-btn"
                          onClick={() => saveEdit(todo._id)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="todo-content">
                        <span
                          className={`todo-text ${todo.completed ? 'completed' : ''}`}
                        >
                          {todo.title}
                        </span>
                        {todo.dueDate && (
                          <span className="todo-date">
                            📅 {new Date(todo.dueDate).toLocaleString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <div className="todo-actions">
                        <button
                          className="edit-btn"
                          onClick={() => startEdit(todo._id, todo.title, todo.dueDate)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTodo(todo._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : (
          <div className="calendar-container">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)}>&lt;</button>
              <h2>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => changeMonth(1)}>&gt;</button>
            </div>
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-label">{day}</div>
              ))}
              {calendarDays.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="calendar-day empty"></div>;

                const dateString = formatDateKey(date);
                const dayTodos = todos.filter(t => t.dueDate && t.dueDate.startsWith(dateString));
                const isSelected = selectedDate && formatDateKey(selectedDate) === dateString;

                return (
                  <div
                    key={dateString}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${dayTodos.length > 0 ? 'has-tasks' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="day-number">{date.getDate()}</span>
                    <div className="day-tasks">
                      {dayTodos.map(t => (
                        <div key={t._id} className={`day-task-dot ${t.completed ? 'done' : ''}`} title={t.title}></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDate && (
              <div className="selected-day-tasks">
                <div className="selected-day-header">
                  <h3>Tasks for {selectedDate.toLocaleDateString()}</h3>
                  <button className="close-details" onClick={() => setSelectedDate(null)}>Close</button>
                </div>
                {(() => {
                  const dateString = formatDateKey(selectedDate);
                  const dayTodos = todos.filter(t => t.dueDate && t.dueDate.startsWith(dateString));

                  return dayTodos.length === 0 ? (
                    <p className="no-tasks">No tasks for this day. 🌴</p>
                  ) : (
                    <ul className="day-todo-list">
                      {dayTodos.map(todo => (
                        <li key={todo._id} className="day-todo-item">
                          <input
                            type="checkbox"
                            className="todo-checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo._id, todo.completed)}
                          />
                          <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>{todo.title}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;