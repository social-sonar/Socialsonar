import { Route, Routes as BaseRoutes } from "react-router-dom";
import Home from "./pages/Home";
import Lists from "./pages/List";
import Product from "./pages/Product";
import Example from "./pages/Example";

export default function Routes() {
  return (
    <BaseRoutes>
    
      <Route path="/" element={<Home />} />
      <Route path="example" element={<Example />} />
      <Route path="list">
        <Route index element={<Lists />} />
        <Route path=":productId" element={<Product />} />
      </Route>
    </BaseRoutes>
  );
}
