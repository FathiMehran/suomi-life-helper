
import { useState } from "react";
import Login from "./pages/Login.jsx";
import Tasks from "./pages/Tasks.jsx";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token")); // 👈 بررسی وجود توکن

  const handleLogout = () => {
    localStorage.removeItem("token"); // پاک کردن توکن
    setLoggedIn(false); // برگشت به صفحه لاگین
  };

  return (
    <div>
      {!loggedIn ? (
        <Login onLogin={() => setLoggedIn(true)} />
      ) : (
        <Tasks onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
