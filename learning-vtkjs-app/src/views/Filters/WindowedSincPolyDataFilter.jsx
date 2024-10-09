import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkHttpDataSetReader from "@kitware/vtk.js/IO/Core/HttpDataSetReader";
import vtkWindowedSincPolyDataFilter from "@kitware/vtk.js/Filters/General/WindowedSincPolyDataFilter";

// Force DataAccessHelper to have access to various data source
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";
function WindowedSincPolyDataFilter() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    numberOfIterations: 20,
    passBand: 0.2,
    featureAngle: 45,
    edgeAngle: 1,
    featureEdgeSmoothing: false,
    boundarySmoothing: true,
    nonManifoldSmoothing: false,
  });
  const updateParam = (type, obj) => {
    const { smoothFilter, renderWindow } = context.current;
    switch (type) {
      case "numberOfIterations":
      case "featureAngle":
      case "edgeAngle":
        smoothFilter.set(obj);
        setState({
          ...state,
          ...obj,
        });
        break;
      case "featureEdgeSmoothing":
      case "boundarySmoothing":
      case "nonManifoldSmoothing":
        smoothFilter.set({ [type]: obj[type] ? 1 : 0 });
        setState({
          ...state,
          ...obj,
        });
        break;
      case "passBand":
        // This formula maps:
        // 0.0  -> 1.0   (almost no smoothing)
        // 0.25 -> 0.1   (average smoothing)
        // 0.5  -> 0.01  (more smoothing)
        // 1.0  -> 0.001 (very strong smoothing)
        let value = 10.0 ** (-4.0 * obj[type]);
        smoothFilter.set({ [type]: value });
        setState({
          ...state,
          ...obj,
        });
        break;
      default:
        break;
    }
    renderWindow.render();
  };

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const actor = vtkActor.newInstance();
    renderer.addActor(actor);

    const mapper = vtkMapper.newInstance({
      interpolateScalarBeforeMapping: true,
    });
    actor.setMapper(mapper);

    const cam = vtkCamera.newInstance();
    renderer.setActiveCamera(cam);
    cam.setFocalPoint(0, 0, 0);
    cam.setPosition(0, 0, 10);
    cam.setClippingRange(0.1, 50.0);

    // Build pipeline
    const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
    reader.setUrl(BaseUrlPross("data/cow.vtp")).then(() => {
      reader.loadData().then(() => {
        renderer.resetCamera();
        renderWindow.render();
      });
    });

    const smoothFilter = vtkWindowedSincPolyDataFilter.newInstance({
      nonManifoldSmoothing: 0,
      numberOfIterations: 10,
    });
    smoothFilter.setInputConnection(reader.getOutputPort());
    mapper.setInputConnection(smoothFilter.getOutputPort());
    context.current = {
      smoothFilter,
      renderWindow,
    };
    renderer.resetCamera();
    renderWindow.render();
  }, []);

  return (
    <div>
      <div
        ref={vtkContainerRef}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      <table
        style={{
          position: "absolute",
          top: "2vh",
          left: "2vw",
          border: "1px solid black",
          padding: "1em",
          backgroundColor: "rgba(255,255,255,0.5)",
        }}
      >
        <tbody
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-even",
          }}
        >
          <tr>
            <td>
              <span>Iterations</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={state.numberOfIterations}
                onChange={(e) => {
                  updateParam("numberOfIterations", {
                    numberOfIterations: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Pass band</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.001"
                value={state.passBand}
                onChange={(e) => {
                  updateParam("passBand", {
                    passBand: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Feature Angle</span>
              <input
                type="range"
                min="1.0"
                max="180.0"
                step="1"
                value={state.featureAngle}
                onChange={(e) => {
                  updateParam("featureAngle", {
                    featureAngle: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Edge Angle</span>
              <input
                type="range"
                min="1.0"
                max="180.0"
                step="1"
                value={state.edgeAngle}
                onChange={(e) => {
                  updateParam("edgeAngle", {
                    edgeAngle: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Feature Edge Smoothing</span>
              <input
                type="checkbox"
                checked={state.featureEdgeSmoothing}
                onChange={(e) => {
                  updateParam("featureEdgeSmoothing", {
                    featureEdgeSmoothing: e.target.checked,
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Boundary Smoothing</span>
              <input
                type="checkbox"
                checked={state.boundarySmoothing}
                onChange={(e) => {
                  updateParam("boundarySmoothing", {
                    boundarySmoothing: e.target.checked,
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Non Manifold Smoothing</span>
              <input
                type="checkbox"
                checked={state.nonManifoldSmoothing}
                onChange={(e) => {
                  updateParam("nonManifoldSmoothing", {
                    nonManifoldSmoothing: e.target.checked,
                  });
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WindowedSincPolyDataFilter;
