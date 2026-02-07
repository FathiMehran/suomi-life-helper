import { useState, useEffect } from "react";
//import TaskCard from "./TaskCard.jsx";


export default function Tasks({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const [deadline, setDeadline] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("not started");
  const [editDeadline, setEditDeadline] = useState("");



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


  // ---------------------------
  // Edit task
  // ---------------------------

  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);
    setEditDeadline(task.deadline ? task.deadline.split("T")[0] : "");
  };


  // ---------------------------
  // Edit task Cancel
  // ---------------------------

  const cancelEdit = () => {
    setEditingTaskId(null);
  };


  // ---------------------------
  // Save & Put Task 
  // ---------------------------
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus,
          deadline: editDeadline ? `${editDeadline}T00:00:00` : null,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      await fetchTasks(); // رفرش لیست
      setEditingTaskId(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);


   // ---------------------------
  //  Delete Task 
  // ---------------------------
  const deleteTask = async () => {

    if (taskToDelete.status === "done") {
      setError("Completed tasks cannot be deleted");
      setShowDeleteModal(false);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/tasks/${taskToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  };


   // ---------------------------
  //  Request Delete Task 
  // ---------------------------
  // const requestDeleteTask = (task) => {
  //   setTaskToDelete(task);
  //   setShowDeleteModal(true);
  // };

   // ---------------------------
  //  Update Task 
  // ---------------------------

  const updateTask = async (id, updatedData) => {
    const res = await fetch(`http://127.0.0.1:8000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      alert("Failed to update task");
      return;
    }

    const updatedTask = await res.json();
    setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
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
 
          <li
            key={task.id}
            style={{
              borderLeft: `5px solid ${getDeadlineColor(task.deadline)}`,
              paddingLeft: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            {editingTaskId === task.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />

                <input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />

                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ marginBottom: "0.5rem" }}
                >
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  style={{ marginBottom: "0.5rem", display: "block" }}
                />

                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button onClick={cancelEdit} style={{ marginLeft: "0.5rem" }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <strong>{task.title}</strong>
                <div>{task.description || "—"}</div>
                <div>Status: {task.status}</div>
                <div>
                  Deadline:{" "}
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "—"}
                </div>

                <button
                  onClick={() => startEdit(task)}
                  style={{ marginTop: "0.5rem" }}
                >
                  Edit
                </button>

                <button
                  disabled={task.status === "done"}
                  onClick={() => {
                    if (task.status === "done") return;
                    setTaskToDelete(task);
                    setShowDeleteModal(true);
                  }}
                  title={
                    task.status === "done"
                      ? "Completed tasks cannot be deleted"
                      : "Delete task"
                  }
                  style={{
                    marginLeft: "0.5rem",
                    color: task.status === "done" ? "#999" : "red",
                    cursor: task.status === "done" ? "not-allowed" : "pointer",
                    opacity: task.status === "done" ? 0.5 : 1,
                  }}
                >
                  🗑 Delete
                </button>


              </>
            )}
          </li>

        ))
      )}
      </ul>

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3>Delete task?</h3>
            <p>
              Are you sure you want to delete
              <br />
              <strong>{taskToDelete?.title}</strong>?
            </p>

            <button
              onClick={deleteTask}
              style={{ background: "red", color: "#fff" }}
            >
              Yes, delete
            </button>

            <button
              onClick={() => {
                setShowDeleteModal(false);
                setTaskToDelete(null);
              }}
              style={{ marginLeft: "0.5rem" }}
            >
              Cancel
            </button>
          </div>
  </div>
)}



    </div>
  );
}
