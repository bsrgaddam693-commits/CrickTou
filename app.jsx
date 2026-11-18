import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8082/api/players";

const emptyForm = {
  name: "",
  age: "",
  role: "",
  team: "",
  battingStyle: "",
};

function App() {
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data?.message || data?.error || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function loadPlayers() {
    setLoading(true);
    setError("");

    try {
      const data = await request(API_URL);
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Could not load players: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const player = {
      name: form.name.trim(),
      age: Number(form.age),
      role: form.role,
      team: form.team.trim(),
      battingStyle: form.battingStyle,
    };

    if (!player.name || !player.team || !player.role ||
        !player.battingStyle || !form.age) {
      setError("Please fill in all fields.");
      return;
    }

    if (!Number.isInteger(player.age) || player.age < 10 || player.age > 60) {
      setError("Age must be a whole number between 10 and 60.");
      return;
    }

    try {
      if (editingId !== null) {
        await request(`${API_URL}/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(player),
        });
        setMessage("Player updated successfully!");
      } else {
        await request(API_URL, {
          method: "POST",
          body: JSON.stringify(player),
        });
        setMessage("Player registered successfully!");
      }

      resetForm();
      await loadPlayers();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEdit(player) {
    setEditingId(player.id);
    setForm({
      name: player.name ?? "",
      age: String(player.age ?? ""),
      role: player.role ?? "",
      team: player.team ?? "",
      battingStyle: player.battingStyle ?? "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await request(`${API_URL}/${id}`, { method: "DELETE" });
      setMessage("Player deleted successfully!");

      if (editingId === id) {
        resetForm();
      }

      await loadPlayers();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredPlayers = players.filter((player) =>
    player.team?.toLowerCase().includes(teamFilter.trim().toLowerCase())
  );

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-icon">🏏</div>
        <h1>CrickApply</h1>
        <p>Cricket Tournament Player Registration</p>
      </header>

      <section className="panel">
        <h2>{editingId !== null ? "Update Player" : "Register a Player"}</h2>

        <form onSubmit={handleSubmit} className="player-form">
          <label>
            Player Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter player name"
              required
            />
          </label>

          <label>
            Age
            <input
              name="age"
              type="number"
              min="10"
              max="60"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
            />
          </label>

          <label>
            Player Role
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="">Select role</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicket-keeper">Wicket-keeper</option>
            </select>
          </label>

          <label>
            Team Name
            <input
              name="team"
              value={form.team}
              onChange={handleChange}
              placeholder="Enter team name"
              required
            />
          </label>

          <label>
            Batting Style
            <select
              name="battingStyle"
              value={form.battingStyle}
              onChange={handleChange}
              required
            >
              <option value="">Select batting style</option>
              <option value="Right-hand bat">Right-hand bat</option>
              <option value="Left-hand bat">Left-hand bat</option>
            </select>
          </label>

          <div className="form-actions">
            <button className="primary-btn" type="submit">
              {editingId !== null ? "Save Changes" : "Register Player"}
            </button>

            {editingId !== null && (
              <button className="secondary-btn" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="notice success">{message}</p>}
        {error && <p className="notice error">{error}</p>}
      </section>

      <section className="panel">
        <div className="list-heading">
          <div>
            <h2>Registered Players</h2>
            <p className="muted">{filteredPlayers.length} player(s) shown</p>
          </div>

          <button className="secondary-btn" onClick={loadPlayers} type="button">
            Refresh
          </button>
        </div>

        <input
          className="search-input"
          value={teamFilter}
          onChange={(event) => setTeamFilter(event.target.value)}
          placeholder="Search by team name..."
        />

        {loading ? (
          <p className="empty-state">Loading players...</p>
        ) : filteredPlayers.length === 0 ? (
          <p className="empty-state">No players found. Register a player to get started.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Batting Style</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>{player.id}</td>
                    <td>{player.name}</td>
                    <td>{player.age}</td>
                    <td>{player.role}</td>
                    <td>{player.team}</td>
                    <td>{player.battingStyle}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(player)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(player.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>CrickApply · Cricket Tournament Management</footer>
    </main>
  );
}

export default App;