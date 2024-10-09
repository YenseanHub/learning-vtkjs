import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import Constants from "@kitware/vtk.js/Filters/General/TubeFilter/Constants";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import * as vtkMath from "@kitware/vtk.js/Common/Core/Math";
import vtkPoints from "@kitware/vtk.js/Common/Core/Points";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import vtkTubeFilter from "@kitware/vtk.js/Filters/General/TubeFilter";

import { DesiredOutputPrecision } from "@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants";
import { VtkDataTypes } from "@kitware/vtk.js/Common/Core/DataArray/Constants";

const { VaryRadius } = Constants;
function TubeFilter() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    numberOfSides: 50,
    radius: 0.1,
    onRatio: 1,
    varyRadius: "VARY_RADIUS_OFF",
    capping: false,
    tubing: true,
  });
  const updateParam = (type, obj) => {
    const { tubeFilter, tubeFilterActor, renderWindow } = context.current;
    switch (type) {
      case "numberOfSides":
      case "radius":
      case "onRatio":
      case "capping":
        tubeFilter.set(obj);
        setState({
          ...state,
          ...obj,
        });
        break;
      case "varyRadius":
        tubeFilter.set({ varyRadius: VaryRadius[obj] });
        setState({
          ...state,
          varyRadius: obj,
        });
        break;
      case "tubing":
        tubeFilterActor.setVisibility(obj);
        setState({
          ...state,
          tubing: obj,
        });
        break;
      default:
        break;
    }
    renderWindow.render();
  };
  function addRepresentation(filter, props = {}) {
    const { renderer } = context.current;
    const mapper = vtkMapper.newInstance();
    if (filter.isA("vtkPolyData")) {
      mapper.setInputData(filter);
    } else {
      mapper.setInputConnection(filter.getOutputPort());
    }

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().set(props);
    renderer.addActor(actor);
    return actor;
  }

  vtkMath.randomSeed(15222);
  const numSegments = 3;

  function initializePolyData(dType) {
    let pointType = VtkDataTypes.FLOAT;
    if (dType === DesiredOutputPrecision.SINGLE) {
      pointType = VtkDataTypes.FLOAT;
    } else if (dType === DesiredOutputPrecision.DOUBLE) {
      pointType = VtkDataTypes.DOUBLE;
    }
    const polyData = vtkPolyData.newInstance();
    const points = vtkPoints.newInstance({ dataType: pointType });
    points.setNumberOfPoints(numSegments + 1);
    const pointData = new Float32Array(3 * (numSegments + 1));
    const verts = new Uint32Array(2 * (numSegments + 1));
    const lines = new Uint32Array(numSegments + 2);
    lines[0] = numSegments + 1;
    const scalarsData = new Float32Array(numSegments + 1);
    const scalars = vtkDataArray.newInstance({
      name: "Scalars",
      values: scalarsData,
    });

    for (let i = 0; i < numSegments + 1; ++i) {
      for (let j = 0; j < 3; ++j) {
        pointData[3 * i + j] = vtkMath.random();
      }
      scalarsData[i] = i * 0.1;
      verts[i] = 1;
      verts[i + 1] = i;
      lines[i + 1] = i;
    }

    points.setData(pointData);
    polyData.setPoints(points);
    polyData.getVerts().setData(verts);
    polyData.getLines().setData(lines);
    polyData.getPointData().setScalars(scalars);
    return polyData;
  }

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const polyData = initializePolyData(DesiredOutputPrecision.DOUBLE);
    const tubeFilter = vtkTubeFilter.newInstance();
    tubeFilter.setCapping(false);
    tubeFilter.setNumberOfSides(50);
    tubeFilter.setRadius(0.1);

    tubeFilter.setInputData(polyData);
    tubeFilter.setInputArrayToProcess(0, "Scalars", "PointData", "Scalars");
    context.current = {
      tubeFilter,
      renderer,
      renderWindow,
    };
    addRepresentation(polyData, {});
    const tubeFilterActor = addRepresentation(tubeFilter, {});
    context.current["tubeFilterActor"] = tubeFilterActor;
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
              <span>Number of Sides</span>
              <input
                type="range"
                min="3"
                max="100"
                step="1"
                value={state.numberOfSides}
                onChange={(e) => {
                  updateParam("numberOfSides", {
                    numberOfSides: Number(e.target.value),
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
                min="0.01"
                max="1.0"
                step="0.01"
                value={state.radius}
                onChange={(e) => {
                  updateParam("radius", {
                    radius: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>OnRatio</span>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="1"
                value={state.onRatio}
                onChange={(e) => {
                  updateParam("onRatio", {
                    onRatio: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Vary Radius</span>
              <select
                value={state.varyRadius}
                style={{ width: "100%" }}
                onInput={(ev) => updateParam("varyRadius", ev.target.value)}
              >
                <option value="VARY_RADIUS_OFF">VARY_RADIUS_OFF</option>
                <option value="VARY_RADIUS_BY_SCALAR">
                  VARY_RADIUS_BY_SCALAR
                </option>
                <option value="VARY_RADIUS_BY_VECTOR">
                  VARY_RADIUS_BY_VECTOR
                </option>
                <option value="VARY_RADIUS_BY_ABSOLUTE_SCALAR">
                  VARY_RADIUS_BY_ABSOLUTE_SCALAR
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <span>Capping</span>
              <input
                type="checkbox"
                checked={state.capping}
                onChange={(e) => {
                  updateParam("capping", {
                    capping: e.target.checked,
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Tubing</span>
              <input
                type="checkbox"
                checked={state.tubing}
                onChange={(e) => {
                  updateParam("tubing", e.target.checked);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TubeFilter;
