import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login";
import Dashboard from "./Dashboard";

const code = new URLSearchParams(window.location.search).get("code");
console.log(code ? "HasCode" : "Not has code");

function App() {
  return code ? <Dashboard code={code} /> : <Login />;
}

export default App;
