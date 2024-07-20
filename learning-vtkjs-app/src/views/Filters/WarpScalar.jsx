import React, { useState, useRef, useEffect } from "react";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import macro from "@kitware/vtk.js/macros";
import vtk from "@kitware/vtk.js/vtk";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkWarpScalar from "@kitware/vtk.js/Filters/General/WarpScalar";

function WarpScalar() {
  const vtkContainerRef = useRef(null);

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    const actor = vtkActor.newInstance();
    actor.getProperty().setEdgeVisibility(true);
    actor.getProperty().setEdgeColor(1, 1, 1);
    // actor.getProperty().setRepresentationToSurface();
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
    const planeSource = vtkPlaneSource.newInstance({
      xResolution: 10,
      yResolution: 10,
      origin: [0, 0, 0],
    });
    const filter = vtkWarpScalar.newInstance({
      scaleFactor: 0.1,
      useNormal: false,
    });

    const randFilter = macro.newInstance((publicAPI, model) => {
      macro.obj(publicAPI, model); // make it an object
      macro.algo(publicAPI, model, 1, 1); // mixin algorithm code 1 in, 1 out
      publicAPI.requestData = (inData, outData) => {
        console.log(inData[0].getPoints().getData());
        // implement requestData
        if (!outData[0] || inData[0].getMTime() > outData[0].getMTime()) {
          const newArray = new Float32Array(
            inData[0].getPoints().getNumberOfPoints()
          );
          for (let i = 0; i < newArray.length; i++) {
            newArray[i] = i % 2 ? 1 : 0;
            // newArray[i] = Math.random();
          }

          const da = vtkDataArray.newInstance({
            name: "spike",
            values: newArray,
          });
          const newDataSet = vtk({ vtkClass: inData[0].getClassName() });
          newDataSet.shallowCopy(inData[0]);
          newDataSet.getPointData().setScalars(da);
          outData[0] = newDataSet;
        }
      };
    })();

    randFilter.setInputConnection(planeSource.getOutputPort());
    filter.setInputConnection(randFilter.getOutputPort());
    mapper.setInputConnection(filter.getOutputPort());

    // Select array to process
    filter.setInputArrayToProcess(0, "spike", "PointData", "Scalars");
    renderer.resetCamera();
    renderWindow.render();
  }, []);

  return (
    <div>
      <div
        ref={vtkContainerRef}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default WarpScalar;
