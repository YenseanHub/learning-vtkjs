import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkImageStreamline from "@kitware/vtk.js/Filters/General/ImageStreamline";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import { Representation } from "@kitware/vtk.js/Rendering/Core/Property/Constants";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import macro from "@kitware/vtk.js/macros";

const vecSource = macro.newInstance((publicAPI, model) => {
  macro.obj(publicAPI, model); // make it an object
  macro.algo(publicAPI, model, 0, 1); // mixin algorithm code 1 in, 1 out
  publicAPI.requestData = (inData, outData) => {
    // implement requestData
    if (!outData[0]) {
      const id = vtkImageData.newInstance();
      id.setSpacing(0.1, 0.1, 0.1);
      const count = 10;
      id.setExtent(0, count - 1, 0, count - 1, 0, count - 1);
      const dims = [count, count, count];

      const newArray = new Float32Array(3 * dims[0] * dims[1] * dims[2]);

      let i = 0;
      for (let z = 0; z < count; z++) {
        for (let y = 0; y < count; y++) {
          for (let x = 0; x < count; x++) {
            newArray[i++] = Math.random() * x;
            const v = 0.1 * y;
            newArray[i++] = Math.random() * v;
            newArray[i++] = 0;
          }
        }
      }

      const da = vtkDataArray.newInstance({
        numberOfComponents: 3,
        values: newArray,
      });
      da.setName("vectors");

      const cpd = id.getPointData();
      cpd.setVectors(da);

      // Update output
      outData[0] = id;
    }
  };
})();

function ImageStreamline() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    xResolution: 10,
    yResolution: 10,
  });
  const updateParam = (obj) => {
    const { planeSource, renderWindow } = context.current;
    planeSource.set(obj);
    setState({
      ...state,
      ...obj,
    });
    renderWindow.render();
  };
  const addRepresentation = (filter, props = {}) => {
    const { renderer } = context.current;
    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(filter.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().set(props);
    renderer.addActor(actor);
  };

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const planeSource = vtkPlaneSource.newInstance();
    // planeSource.setOrigin(0.05, 0.05, 0.05);
    // planeSource.setPoint1(0.05, 0.85, 0.05);
    // planeSource.setPoint2(0.05, 0.05, 0.85);
    planeSource.setOrigin(0.01, 0.0, 0.0);
    planeSource.setPoint1(0.01, 0.9, 0.0);
    planeSource.setPoint2(0.01, 0.0, 0.9);
    const sline = vtkImageStreamline.newInstance();
    sline.setIntegrationStep(0.01);
    sline.setInputConnection(vecSource.getOutputPort());
    sline.setInputConnection(planeSource.getOutputPort(), 1);

    const outlineFilter = vtkOutlineFilter.newInstance();
    outlineFilter.setInputConnection(vecSource.getOutputPort());

    context.current = {
      planeSource,
      renderer,
      renderWindow,
    };

    addRepresentation(sline, {
      diffuseColor: [0, 1, 1],
      lineWidth: 3,
    });
    addRepresentation(outlineFilter, {
      diffuseColor: [1, 0, 0],
      lineWidth: 1.5,
    });
    addRepresentation(planeSource, {
      representation: Representation.POINTS,
      pointSize: 10,
    });

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
              <span>X Resolution </span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={state.xResolution}
                onChange={(e) => {
                  updateParam({
                    xResolution: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Y Resolution </span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={state.yResolution}
                onChange={(e) => {
                  updateParam({
                    yResolution: Number(e.target.value),
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

export default ImageStreamline;
