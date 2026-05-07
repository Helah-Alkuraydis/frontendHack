function Tabs({ mode, setMode }) {
  return (
    <div className="tabs">
      <button
        className={`tab ${mode === "register" ? "active" : ""}`}
        onClick={() => setMode("register")}
      >
        REGISTER
      </button>

      <button
        className={`tab ${mode === "login" ? "active" : ""}`}
        onClick={() => setMode("login")}
      >
        LOG IN
      </button>
    </div>
  );
}

export default Tabs;
