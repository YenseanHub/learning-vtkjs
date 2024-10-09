import React, { useState, useRef, useEffect } from "react";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCutter from "@kitware/vtk.js/Filters/Core/Cutter";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import HttpDataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import DataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper";

import vtkHttpSceneLoader from "@kitware/vtk.js/IO/Core/HttpSceneLoader";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPlane from "@kitware/vtk.js/Common/DataModel/Plane";
import vtkProperty from "@kitware/vtk.js/Rendering/Core/Property";
// Force DataAccessHelper to have access to various data source
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";
function Cutter() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  const [state, setState] = useState({
    originX: 0,
    originY: 0,
    originZ: 0,
    normalX: 1,
    normalY: 0,
    normalZ: 0,
  });
  const updatePlaneFunction = () => {
    const { plane, renderWindow } = context.current;
    plane.setOrigin(state.originX, state.originY, state.originZ);
    plane.setNormal(state.normalX, state.normalY, state.normalZ);
    renderWindow.render();
  };
  const updatePlane = (obj) => {
    setState({
      ...state,
      ...obj,
    });
    updatePlaneFunction();
  };
  const GetModel = async () => {
    const { renderer, cutter, cubeMapper } = context.current;
    HttpDataAccessHelper.fetchBinary(
      BaseUrlPross("data/StanfordDragon.vtkjs"),
      {}
    ).then((zipContent) => {
      const dataAccessHelper = DataAccessHelper.get("zip", {
        zipContent,
        callback: (zip) => {
          const sceneImporter = vtkHttpSceneLoader.newInstance({
            renderer,
            dataAccessHelper,
          });
          sceneImporter.setUrl("index.json");
          sceneImporter.onReady(() => {
            sceneImporter.getScene()[0].actor.setVisibility(false);

            const source = sceneImporter.getScene()[0].source;
            cutter.setInputConnection(source.getOutputPort());
            cubeMapper.setInputConnection(source.getOutputPort());
            renderer.resetCamera();
            updatePlaneFunction();
          });
        },
      });
    });
  };
  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const plane = vtkPlane.newInstance();

    const cutter = vtkCutter.newInstance();
    cutter.setCutFunction(plane);

    const cutMapper = vtkMapper.newInstance();
    cutMapper.setInputConnection(cutter.getOutputPort());
    const cutActor = vtkActor.newInstance();
    cutActor.setMapper(cutMapper);
    const cutProperty = cutActor.getProperty();
    cutProperty.setRepresentation(vtkProperty.Representation.WIREFRAME);
    cutProperty.setLighting(false);
    cutProperty.setColor(0, 0, 1);
    renderer.addActor(cutActor);

    const cubeMapper = vtkMapper.newInstance();
    cubeMapper.setScalarVisibility(false);
    const cubeActor = vtkActor.newInstance();
    cubeActor.setMapper(cubeMapper);
    const cubeProperty = cubeActor.getProperty();
    cubeProperty.setRepresentation(vtkProperty.Representation.WIREFRAME);
    cubeProperty.setLighting(false);
    cubeProperty.setOpacity(0.1);
    renderer.addActor(cubeActor);

    context.current = {
      plane,
      cutter,
      cubeMapper,
      renderer,
      renderWindow,
    };
    GetModel();
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
        <tbody>
          <tr>
            <td>OriginX : </td>
            <td>
              <span>-6</span>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.1"
                value={state.originX}
                onChange={(e) => {
                  updatePlane({ originX: e.target.value });
                }}
              />
              <span>+6</span>
            </td>
          </tr>
          <tr>
            <td>OriginY : </td>
            <td>
              <span>-0.5</span>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.02"
                value={state.originY}
                onChange={(e) => {
                  updatePlane({ originY: e.target.value });
                }}
              />
              <span>+0.5</span>
            </td>
          </tr>
          <tr>
            <td>OriginZ : </td>
            <td>
              <span>-0.5</span>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.02"
                value={state.originZ}
                onChange={(e) => {
                  updatePlane({ originZ: e.target.value });
                }}
              />
              <span>+0.5</span>
            </td>
          </tr>
          <tr>
            <td>NormalX : </td>
            <td>
              <span>-1</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={state.normalX}
                onChange={(e) => {
                  updatePlane({ normalX: e.target.value });
                }}
              />
              <span>+1</span>
            </td>
          </tr>
          <tr>
            <td>NormalY : </td>
            <td>
              <span>-1</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={state.normalY}
                onChange={(e) => {
                  updatePlane({ normalY: e.target.value });
                }}
              />
              <span>+1</span>
            </td>
          </tr>
          <tr>
            <td>NormalZ : </td>
            <td>
              <span>-1</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={state.normalZ}
                onChange={(e) => {
                  updatePlane({ normalZ: e.target.value });
                }}
              />
              <span>+1</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Cutter;
