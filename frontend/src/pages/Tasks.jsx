import { useState, useEffect } from "react";

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // ---------------------------
  // Fetch tasks
  // ---------------------------
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/tasks/?page=1&page_size=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      setTasks(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ---------------------------
  // Create task
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/tasks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, status }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTitle("");
      setDescription("");
      setStatus("not started");
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>My Tasks</h2>
        <button onClick={onLogout}>Logout</button>
      </div>

      <h3>Create Task</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="not started">Not Started</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <br />

        <button type="submit">Create Task</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {tasks.length === 0 ? (
          <li>No tasks found</li>
        ) : (
          tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.title}</strong> – {task.description} ({task.status})
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
