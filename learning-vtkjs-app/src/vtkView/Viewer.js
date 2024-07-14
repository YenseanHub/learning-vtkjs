import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";

export default class Viewer {
  constructor(domContainer) {
    this.domContainer = domContainer;
    this.renderer = null;
    this.renderWindow = null;
    this.actorList = [];
  }
  init() {
    this.fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      rootContainer: this.domContainer,
    });
    this.renderer = this.fullScreenRenderer.getRenderer();
    this.renderWindow = this.fullScreenRenderer.getRenderWindow();

    this.renderWindow.render();
  }
  addCone() {
    this.coneSource = vtkConeSource.newInstance({ height: 1.0 });
    // this.coneSource = vtkCubeSource.newInstance({
    //   xLength: 5,
    //   yLength: 5,
    //   zLength: 5,
    // });

    this.mapper = vtkMapper.newInstance();
    let coneOutPut = this.coneSource.getOutputPort();

    this.mapper.setInputConnection(coneOutPut);

    this.actor = vtkActor.newInstance();
    this.actor.setMapper(this.mapper);

    this.renderer.addActor(this.actor);
    this.resetCamera();
  }
  resetCamera() {
    this.renderer.resetCamera();
    this.renderWindow.render();
  }

  destory() {
    this.actor.delete();
    this.mapper.delete();
    this.coneSource.delete();
    this.fullScreenRenderer.delete();
  }
  render() {
    this.renderWindow.render();
  }
}
