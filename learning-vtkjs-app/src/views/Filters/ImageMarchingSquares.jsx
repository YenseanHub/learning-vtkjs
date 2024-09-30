import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkImageMarchingSquares from "@kitware/vtk.js/Filters/General/ImageMarchingSquares";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSampleFunction from "@kitware/vtk.js/Imaging/Hybrid/SampleFunction";
import vtkSphere from "@kitware/vtk.js/Common/DataModel/Sphere";
import vtkImplicitBoolean from "@kitware/vtk.js/Common/DataModel/ImplicitBoolean";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";

function ImageMarchingSquares() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const { Operation } = vtkImplicitBoolean;
  const [state, setState] = useState({
    slicingMode: 0,
    volumeResolution: 50,
    sphereRadiusLeft: 3.0,
    sphereRadiusRight: 0.5,
    mergePoints: false,
  });
  const updateParam = (value) => {
    const { mSquares, renderWindow } = context.current;
    mSquares.setSlicingMode(value);
    setState({
      ...state,
      slicingMode: value,
    });
    renderWindow.render();
  };
  const createSphere = (center, radius) => {
    const source = vtkSphereSource.newInstance();
    source.setCenter(center);
    source.setThetaResolution(50);
    source.setRadius(radius);
    const actor = vtkActor.newInstance();
    const mapper = vtkMapper.newInstance();

    actor.getProperty().setEdgeVisibility(true);
    actor.getProperty().setOpacity(0.3);
    mapper.setInputConnection(source.getOutputPort());
    actor.setMapper(mapper);

    return actor;
  };
  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    const { Operation } = vtkImplicitBoolean;

    const actor = vtkActor.newInstance();
    renderer.addActor(actor);

    const mapper = vtkMapper.newInstance();
    actor.setMapper(mapper);

    // Build pipeline
    const sphere = vtkSphere.newInstance({
      center: [-2.5, 0.0, 0.0],
      radius: 3.0,
    });
    const sphere2 = vtkSphere.newInstance({
      center: [2.5, 0.0, 0.0],
      radius: 0.5,
    });
    // const plane = vtkPlane.newInstance({ origin: [0, 0, 0], normal: [0, 1, 0] });
    const impBool = vtkImplicitBoolean.newInstance({
      operation: Operation.UNION,
      functions: [sphere, sphere2],
    });
    const sample = vtkSampleFunction.newInstance({
      implicitFunction: impBool,
      sampleDimensions: [50, 50, 50],
      modelBounds: [-5.0, 5.0, -2.0, 2.0, -1.0, 1.0],
    });

    // Isocontour
    const mSquares = vtkImageMarchingSquares.newInstance({ slice: 1 });
    mSquares.setSlicingMode(2);

    // Connect the pipeline proper
    mSquares.setInputConnection(sample.getOutputPort());
    mapper.setInputConnection(mSquares.getOutputPort());

    // Update the pipeline to obtain metadata (range) about scalars
    sample.update();
    const cValues = [];
    const [min, max] = sample
      .getOutputData()
      .getPointData()
      .getScalars()
      .getRange();
    const step = 20;
    for (let i = 0; i < step; ++i) {
      cValues[i] = min + (i / (step - 1)) * (max - min);
    }
    mSquares.setContourValues(cValues);
    mSquares.setSlice(25);
    // Create an outline
    // Bounding box
    const outline = vtkOutlineFilter.newInstance();
    outline.setInputConnection(sample.getOutputPort());
    const outlineMapper = vtkMapper.newInstance();
    outlineMapper.setInputConnection(outline.getOutputPort());
    const outlineActor = vtkActor.newInstance();
    outlineActor.setMapper(outlineMapper);
    renderer.addActor(outlineActor);

    context.current = {
      mSquares,
      renderer,
      renderWindow,
    };

    // 同步sphere
    const sphereReference = createSphere([-2.5, 0.0, 0.0], 3.0);
    renderer.addActor(sphereReference);
    const sphereReference2 = createSphere([2.5, 0.0, 0.0], 0.5);
    renderer.addActor(sphereReference2);

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
              <span>Slicing mode</span>
              <select
                value={state.slicingMode}
                onChange={(e) => {
                  updateParam(Number(e.target.value));
                }}
              >
                <option value={0}>I</option>
                <option value={1}>J</option>
                <option value={2}>K</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ImageMarchingSquares;
