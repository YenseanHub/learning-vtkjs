import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import {
  createCone,
  createCircle,
  createArrow,
  createConcentricCylinder,
} from "./SourcePipeLine";

export default class Viewer {
  constructor(domContainer) {
    this.domContainer = domContainer;
    this.renderer = null;
    this.renderWindow = null;
    this.actorList = [];
    this.mapperList = [];
    this.sourceList = [];
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
    this.addSource(createCone);
  }
  addCircle() {
    this.addSource(createCircle);
  }
  addArrow() {
    this.addSource(createArrow);
  }
  addConcentricCylinder() {
    this.addSource(createConcentricCylinder);
  }
  addSource(sourceCb) {
    const { actor, mapper, source } = sourceCb();
    this.renderer.addActor(actor);
    this.actorList.push(actor);
    this.mapperList.push(mapper);
    this.sourceList.push(source);
  }
  resetCamera() {
    this.renderer.resetCamera();
    this.renderWindow.render();
  }
  setAllResolution(coneResolution) {
    this.sourceList.forEach((item) => {
      item.setResolution(coneResolution);
    });
  }
  setAllRepresentation(representation) {
    this.actorList.forEach((item) => {
      item.getProperty().setRepresentation(representation);
    });
  }
  clearList(arrayList) {
    if (arrayList != null) {
      arrayList.forEach((item) => {
        item.delete();
      });
    }
  }
  destory() {
    this.clearList(this.actor);
    this.clearList(this.mapper);
    this.clearList(this.sourceList);
    this.fullScreenRenderer.delete();
  }
  render() {
    this.renderWindow.render();
  }
}
