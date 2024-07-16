import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkCircleSource from "@kitware/vtk.js/Filters/Sources/CircleSource";
import vtkArrowSource from "@kitware/vtk.js/Filters/Sources/ArrowSource";
import vtkConcentricCylinderSource from "@kitware/vtk.js/Filters/Sources/ConcentricCylinderSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";

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
