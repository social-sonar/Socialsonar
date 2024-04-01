import { Link } from "react-router-dom";

import Routes from "./routes";

function App() {
  return (
    <>
      <header>
        <strong>React app</strong>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/list">Lists</Link>
            </li>
            <li>
              <Link to="/example">Example</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <Routes />
      </main>
    </>
  );
}

export default App;
