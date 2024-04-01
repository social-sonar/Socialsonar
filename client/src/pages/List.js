import { Link } from "react-router-dom";

export default function List() {
  return (
    <ul className="products">
      <li>
        <Link to="produto-1">Produto 1</Link>
      </li>
      <li>
        <Link to="produto-3?color=green">Produto 3</Link>
      </li>
    </ul>
  );
}
