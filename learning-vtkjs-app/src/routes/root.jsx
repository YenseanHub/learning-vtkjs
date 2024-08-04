import { useRoutes } from "react-router-dom";
import Home from "../views/Home";
import ErrorPage from "../views/ErrorPage";
import HelloVTK from "../views/HelloVTK";
import VTKSource from "../views/vtkSource";
import WarpScalar from "../views/Filters/WarpScalar";
import LookUpTable from "../views/Common/LookUpTable";
import Calculator from "../views/Filters/Calculator";
import ClipClosedSurface from "../views/Filters/ClipClosedSurface";

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
    path: "/filters/wrapscalar",
    name: "WrapScalar",
    element: <WarpScalar/>,
    url: "images/WarpScalar.png",
  },
  {
    path: "/common/lookuptable",
    name: "LookUpTable",
    element: <LookUpTable />,
    url: "images/LookUpTable.png",
  },
  {
    path: "/filters/calculator",
    name: "Calculator",
    element: <Calculator />,
    url: "images/Calculator.png",
  },
  {
    path: "/filters/ClipClosedSurface",
    name: "ClipClosedSurface",
    element: <ClipClosedSurface />,
    url: "images/Calculator.png",
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
