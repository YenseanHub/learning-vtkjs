import { useRoutes } from "react-router-dom";
import Home from "../views/Home";
import ErrorPage from "../views/ErrorPage";
import HelloVTK from "../views/HelloVTK";
import VTKSource from "../views/vtkSource";

export const routers = [
  {
    path: "/",
    name: "Home",
    element: <Home />,
  },
  {
    path: "/hellovtk",
    name: "HelloVtk",
    element: <HelloVTK />,
    url: "images/hellovtk.png",
  },
  {
    path: "/vtksource",
    name: "VTKSource",
    element: <VTKSource />,
    url: "images/vtkSource.png",
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
];

const Router = () => {
  const routes = useRoutes(routers);
  return routes;
};

export default Router;
