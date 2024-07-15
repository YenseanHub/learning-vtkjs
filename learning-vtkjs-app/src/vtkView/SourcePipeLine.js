import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";

export function createCone() {
  const coneSource = vtkConeSource.newInstance({ height: 1.0 });
  // this.coneSource = vtkCubeSource.newInstance({
  //   xLength: 5,
  //   yLength: 5,
  //   zLength: 5,
  // });

  const mapper = vtkMapper.newInstance();
  let coneOutPut = coneSource.getOutputPort();

  mapper.setInputConnection(coneOutPut);

  const actor = vtkActor.newInstance();
  actor.setMapper(mapper);
  return { coneSource, mapper, actor };
}
