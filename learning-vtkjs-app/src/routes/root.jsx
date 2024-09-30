import { useRoutes } from "react-router-dom";
import Home from "../views/Home";
import ErrorPage from "../views/ErrorPage";
import HelloVTK from "../views/HelloVTK";
import VTKSource from "../views/vtkSource";
import WarpScalar from "../views/Filters/WarpScalar";
import LookUpTable from "../views/Common/LookUpTable";
import Calculator from "../views/Filters/Calculator";
import ClipClosedSurface from "../views/Filters/ClipClosedSurface";
import ContourLoopExtraction from "../views/Filters/ContourLoopExtraction";
import ContourTriangulator from "../views/Filters/ContourTriangulator";
import ImageCropFilter from "../views/Filters/ImageCropFilter";
import ImageMarchingCubes from "../views/Filters/ImageMarchingCubes";
import ImplicitBoolean from "../views/Common/ImplicitBoolean";
import OutlineFilter from "../views/Filters/OutlineFilter";
import ImageMarchingSquares from "../views/Filters/ImageMarchingSquares";

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
    url: "images/ClipClosedSurface.png",
  },
  {
    path: "/filters/ContourLoopExtraction",
    name: "ContourLoopExtraction",
    element: <ContourLoopExtraction />,
    url: "images/ContourLoopExtraction.png",
  },
  {
    path: "/filters/ContourTriangulator",
    name: "ContourTriangulator",
    element: <ContourTriangulator />,
    url: "images/ContourTriangulator.png",
  },
  {
    path: "/filters/ImageCropFilter",
    name: "ImageCropFilter",
    element: <ImageCropFilter />,
    url: "images/ImageCropFilter.png",
  },
  {
    path: "/filters/ImplicitBoolean",
    name: "ImplicitBoolean",
    element: <ImplicitBoolean />,
    url: "images/ImplicitBoolean.png",
  },
  {
    path: "/filters/OutlineFilter",
    name: "OutlineFilter",
    element: <OutlineFilter />,
    url: "images/OutlineFilter.png",
  },
  {
    path: "/filters/ImageMarchingCubes",
    name: "ImageMarchingCubes",
    element: <ImageMarchingCubes />,
    url: "images/ImageMarchingCubes.png",
  },
  {
    path: "/filters/ImageMarchingSquares",
    name: "ImageMarchingSquares",
    element: <ImageMarchingSquares />,
    url: "images/ImageMarchingSquares.png",
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
