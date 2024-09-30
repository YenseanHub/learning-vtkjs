import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkPointSource from "@kitware/vtk.js/Filters/Sources/PointSource";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";

function ImageMarchingSquares() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  const [state, setState] = useState({
    numberOfPoints: 25,
    radius: 0.25,
  });
  const updateParam = (obj) => {
    const { pointSource, renderWindow } = context.current;
    pointSource.set(obj);
    setState({
      ...state,
      ...obj,
    });
    renderWindow.render();
  };
  const addRepresentation = (name, filter, props = {}) => {
    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(filter.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().set(props);
    return actor;
  };
  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    vtkMath.randomSeed(141592);

    const pointSource = vtkPointSource.newInstance({
      numberOfPoints: 25,
      radius: 0.25,
    });
    const outline = vtkOutlineFilter.newInstance();

    const cone = vtkConeSource.newInstance({
      height: 0.7,
      radius: 0.05,
      resolution: 80,
    });
    const actorCone = vtkActor.newInstance();
    const mapperCone = vtkMapper.newInstance();
    mapperCone.setInputConnection(cone.getOutputPort());
    actorCone.setMapper(mapperCone);
    renderer.addActor(actorCone);
    
    outline.setInputConnection(cone.getOutputPort());
    outline.setInputConnection(pointSource.getOutputPort());

    const pointActor = addRepresentation("pointSource", pointSource, {
      pointSize: 5,
    });
    const outlineActor = addRepresentation("outline", outline, {
      lineWidth: 5,
    });
    renderer.addActor(pointActor);
    renderer.addActor(outlineActor);

    context.current = {
      pointSource,
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
              <span>Number of Points</span>
              <input
                type="range"
                min="1"
                max="500"
                step="1"
                value={state.numberOfPoints}
                onChange={(e) => {
                  updateParam({
                    numberOfPoints: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Radius</span>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.01"
                value={state.radius}
                onChange={(e) => {
                  updateParam({
                    radius: Number(e.target.value),
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

export default ImageMarchingSquares;
