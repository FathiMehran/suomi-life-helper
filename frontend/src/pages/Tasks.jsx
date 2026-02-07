import { useState, useEffect } from "react";

export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const [deadline, setDeadline] = useState("");


  function getDeadlineColor(deadline) {
  if (!deadline) return "black";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);

  if (d < today) return "red";        // گذشته
  if (d.getTime() === today.getTime()) return "orange"; // امروز
  return "green";                     // آینده
}

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

    const deadlineISO = deadline
    ? new Date(deadline + "T00:00:00").toISOString()
    : null;


    try {
      const res = await fetch("http://127.0.0.1:8000/tasks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        //body: JSON.stringify({ title, description, status }),

        body: JSON.stringify({
          title,
          description,
          status,
          deadline: deadlineISO, // || null
        }),


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
    setDeadline("");
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
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          style={{ marginBottom: "1rem" }}
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
        tasks.map(task => (
          <li key={task.id}
  style={{
    borderLeft: `5px solid ${getDeadlineColor(task.deadline)}`,
    paddingLeft: "0.5rem",
    marginBottom: "1rem"
  }}>
            <strong>{task.title}</strong>
            <div>{task.description}</div>
            <div>Status: {task.status}</div>
            <div>
              Deadline:{" "}
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "—"}
            </div>
          </li>
        ))
      )}
      </ul>

    </div>
  );
}
