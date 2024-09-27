import React, { useState, useRef, useEffect } from "react";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCamera from "@kitware/vtk.js/Rendering/Core/Camera";
import vtkCellArray from "@kitware/vtk.js/Common/Core/CellArray";
import vtkContourTriangulator from "@kitware/vtk.js/Filters/General/ContourTriangulator";
import vtkProperty from "@kitware/vtk.js/Rendering/Core/Property";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPoints from "@kitware/vtk.js/Common/Core/Points";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";

function ContourTriangulator() {
  const vtkContainerRef = useRef(null);

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
      interpolateScalarBeforeMapping: false,
    });
    actor.setMapper(mapper);
    const property = actor.getProperty();
    property.setRepresentation(vtkProperty.Representation.WIREFRAME);
    
    const cam = vtkCamera.newInstance();
    renderer.setActiveCamera(cam);
    cam.setFocalPoint(0, 0, 0);
    cam.setPosition(0, 0, 10);
    cam.setClippingRange(0.1, 50.0);

    const source = vtkPolyData.newInstance();
    // Generate a ring of points
    const nbPoints = 28;
    const points = vtkPoints.newInstance({
      size: nbPoints * 3,
    });
    source.setPoints(points);
    const lines = vtkCellArray.newInstance();
    source.setLines(lines);

    for (let i = 0; i < nbPoints; i++) {
      const phi = (i * (2 * Math.PI)) / nbPoints;
      points.setPoint(i, Math.cos(phi), Math.sin(phi), 0);

      // Connect points with lines
      if (i === nbPoints - 1) {
        lines.insertNextCell([i, 0]);
      } else {
        lines.insertNextCell([i, i + 1]);
      }
    }

    // Build pipeline
    const filter = vtkContourTriangulator.newInstance();
    filter.setInputData(source);

    mapper.setInputConnection(filter.getOutputPort());

    // -----------------------------------------------------------

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

export default ContourTriangulator;
