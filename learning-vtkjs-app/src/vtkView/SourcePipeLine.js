import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkCircleSource from "@kitware/vtk.js/Filters/Sources/CircleSource";
import vtkArrowSource from "@kitware/vtk.js/Filters/Sources/ArrowSource";
import vtkConcentricCylinderSource from "@kitware/vtk.js/Filters/Sources/ConcentricCylinderSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";
import vtkCursor3D from "@kitware/vtk.js/Filters/Sources/Cursor3D";
import vtkCylinderSource from "@kitware/vtk.js/Filters/Sources/CylinderSource";
import vtkLineSource from "@kitware/vtk.js/Filters/Sources/LineSource";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkPointSource from "@kitware/vtk.js/Filters/Sources/PointSource";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";

export function createCone() {
  const source = vtkConeSource.newInstance({ height: 1.0 });
  // this.coneSource = vtkCubeSource.newInstance({
  //   xLength: 5,
  //   yLength: 5,
  //   zLength: 5,
  // });
  source.set({
    center: [3, 0, 0],
  });
  const mapper = vtkMapper.newInstance();
  let coneOutPut = source.getOutputPort();

  mapper.setInputConnection(coneOutPut);

  const actor = vtkActor.newInstance();
  actor.getProperty().setColor(1, 0, 0);
  actor.setMapper(mapper);
  return { source, mapper, actor };
}

export function createCircle() {
  const source = vtkCircleSource.newInstance();
  source.set({
    center: [-3, 0, 0],
    resolution: 120,
    direction: [0, 0, 1],
  });
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  source.setLines(true);
  source.setFace(true);

  actor.setMapper(mapper);
  mapper.setInputConnection(source.getOutputPort());

  return { source, mapper, actor };
}

export function createArrow() {
  const source = vtkArrowSource.newInstance();
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.setMapper(mapper);
  actor.getProperty().setEdgeVisibility(true);
  actor.getProperty().setEdgeColor(1, 0, 0);
  actor.getProperty().setRepresentationToSurface();
  mapper.setInputConnection(source.getOutputPort());

  return { source, mapper, actor };
}

export function createConcentricCylinder() {
  const source = vtkConcentricCylinderSource.newInstance({
    height: 0.25,
    center: [3, 2, 0],
    radius: [0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
    cellFields: [0, 0.2, 0.4, 0.6, 0.7, 0.8, 0.9, 1],
    startTheta: 0,
    endTheta: 90,
    resolution: 60,
    skipInnerFaces: true,
  });
  source.setMaskLayer(3, true);
  source.setMaskLayer(6, true);
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.setMapper(mapper);
  mapper.setInputConnection(source.getOutputPort());

  return { source, mapper, actor };
}

export function createCube() {
  const source = vtkCubeSource.newInstance();
  source.setCenter([2, -2, 0]);
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.setMapper(mapper);
  mapper.setInputConnection(source.getOutputPort());

  return { source, mapper, actor };
}

export function createCursor3D() {
  const source = vtkCursor3D.newInstance();
  source.setFocalPoint([0, 0, 0]);
  source.setModelBounds([-1, 1, -1, 1, -1, 1]);
  const mapper = vtkMapper.newInstance();
  mapper.setInputConnection(source.getOutputPort());
  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  return { source, mapper, actor };
}

export function createCylinder() {
  const source = vtkCylinderSource.newInstance();
  source.setCenter([-3, 3, 0]);
  source.setResolution(100);
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.setMapper(mapper);
  mapper.setInputConnection(source.getOutputPort());

  return { source, mapper, actor };
}

export function createLine() {
  const source = vtkLineSource.newInstance();
  source.setPoint1([3, 3, 0]);
  source.setPoint2([-3, -3, 0]);
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.getProperty().setPointSize(10);
  actor.setMapper(mapper);
  mapper.setInputConnection(source.getOutputPort());
  return { source, mapper, actor };
}

export function createPlane() {
  const source = vtkPlaneSource.newInstance();
  source.setCenter([0, 3, 0]);
  const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();
  mapper.setInputConnection(source.getOutputPort());
  actor.setMapper(mapper);
  return { source, mapper, actor };
}

export function createPoint() {
  const source = vtkPointSource.newInstance({
    numberOfPoints: 25,
    radius: 1,
  });
  source.setCenter([-2, -2, 0]);
  // source.setNumberOfPoints(25);
  // source.setRadius(0.25);
  const mapper = vtkMapper.newInstance();

  const actor = vtkActor.newInstance();
  actor.getProperty().setEdgeVisibility(true);
  actor.getProperty().setPointSize(5);

  mapper.setInputConnection(source.getOutputPort());
  actor.setMapper(mapper);
  return { source, mapper, actor };
}

export function createSphere() {
  const source = vtkSphereSource.newInstance();
  source.setCenter([0, -3, 0]);
  source.setThetaResolution(50);
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.getProperty().setEdgeVisibility(true);

  mapper.setInputConnection(source.getOutputPort());
  actor.setMapper(mapper);
  return { source, mapper, actor };
}
