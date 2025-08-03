import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { jsPDF } from "jspdf";
import "tailwindcss/tailwind.css";

export default function DiaryApp() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("😊");
  const [theme, setTheme] = useState("theme1");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("diaryEntries");
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
  }, [entries]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  const addEntry = () => {
    if (text.trim()) {
      const newEntry = { text, mood, id: Date.now() };
      setEntries([...entries, newEntry]);
      setText("");
    }
  };

  const deleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    entries.forEach((entry, index) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(`${index + 1}. ${entry.text} ${entry.mood}`, 10, y);
      y += 10;
    });

    doc.save("MyDiary.pdf");
  };

  return (
    <div className="min-h-screen p-4 text-white transition-all duration-300">
      {user ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button onClick={handleLogout} className="p-2 bg-red-400 rounded">
              Logout
            </button>
            <select onChange={(e) => setMood(e.target.value)} className="p-2 bg-gray-800 rounded">
              <option>😊</option>
              <option>😢</option>
              <option>😡</option>
              <option>😴</option>
            </select>
            <select onChange={(e) => setTheme(e.target.value)} className="p-2 bg-purple-500 rounded">
              <option value="theme1">Holo Pink</option>
              <option value="theme2">Holo Blue</option>
              <option value="theme3">Holo Purple</option>
            </select>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 mb-2 bg-white text-black rounded"
            placeholder="Write your thoughts..."
          ></textarea>

          <div className="flex gap-2 mb-4">
            <button onClick={addEntry} className="p-2 bg-green-400 rounded">
              Add Entry
            </button>
            <button onClick={downloadPDF} className="p-2 bg-blue-400 rounded">
              Download as PDF
            </button>
          </div>

          <div>
            {entries.map((entry) => (
              <div key={entry.id} className="p-3 m-2 bg-gray-800 rounded">
                <span>{entry.text} {entry.mood}</span>
                <button onClick={() => deleteEntry(entry.id)} className="ml-2 text-red-500">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button onClick={handleLogin} className="p-3 bg-blue-500 rounded">
          Login with Google
        </button>
      )}
    </div>
  );
}
