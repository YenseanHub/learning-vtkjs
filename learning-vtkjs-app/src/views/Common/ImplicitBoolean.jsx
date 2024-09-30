import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSampleFunction from "@kitware/vtk.js/Imaging/Hybrid/SampleFunction";
import vtkPlane from "@kitware/vtk.js/Common/DataModel/Plane";
import vtkCylinder from "@kitware/vtk.js/Common/DataModel/Cylinder";
import vtkImplicitBoolean from "@kitware/vtk.js/Common/DataModel/ImplicitBoolean";
import vtkSphere from "@kitware/vtk.js/Common/DataModel/Sphere";

function ImplicitBoolean() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const { Operation } = vtkImplicitBoolean;

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const actor = vtkActor.newInstance();
    renderer.addActor(actor);

    const mapper = vtkMapper.newInstance();
    actor.setMapper(mapper);

    // Build pipeline. Boolean together some implicit functions and then sample, isosurface them
    const pLeft = vtkSphere.newInstance({
      center: [-6.0, 0, 0],
      radius: 0.6,
      
    });
    const pRight = vtkPlane.newInstance({
      normal: [1, 0, 0],
      origin: [5, 0, 0],
    });
    const cyl = vtkCylinder.newInstance({
      radius: 0.5,
      center: [0, 0, 0],
      axis: [1, 0, 0],
    });
    const lCylCut = vtkImplicitBoolean.newInstance({
      operation: Operation.UNION,
      functions: [cyl, pLeft],
    });
    const rCylCut = vtkImplicitBoolean.newInstance({
      operation: Operation.INTERSECTION,
    });
    rCylCut.addFunction(lCylCut);
    rCylCut.addFunction(pRight);

    const sample = vtkSampleFunction.newInstance({
      implicitFunction: rCylCut,
      sampleDimensions: [100, 100, 100],
      modelBounds: [-7.5, 7.5, -1, 1, -1, 1],
    });
    const mCubes = vtkImageMarchingCubes.newInstance({ contourValue: 0.0 });

    // Connect the pipeline proper
    mCubes.setInputConnection(sample.getOutputPort());
    mapper.setInputConnection(mCubes.getOutputPort());

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

export default ImplicitBoolean;
