import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import { createCone } from "./SourcePipeLine";

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
    const { actor, mapper, coneSource } = createCone();

    this.renderer.addActor(actor);
    this.actorList.push(actor);
    this.mapperList.push(mapper);
    this.sourceList.push(coneSource);
    this.resetCamera();
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
    arrayList.forEach((item) => {
      item.delete();
    });
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
