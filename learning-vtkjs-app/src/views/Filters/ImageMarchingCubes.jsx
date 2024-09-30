import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSampleFunction from "@kitware/vtk.js/Imaging/Hybrid/SampleFunction";
import vtkSphere from "@kitware/vtk.js/Common/DataModel/Sphere";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";

function ImageMarchingCubes() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    isoValue: 0,
    volumeResolution: 50,
    sphereRadius: 0.025,
    computeNormals: false,
    mergePoints: false,
  });
  const updateParam = (type, obj) => {
    const { sample, sphere, sphereSource, mCubes, renderWindow } =
      context.current;
    let value;
    switch (type) {
      case "volumeResolution":
        value = obj.volumeResolution;
        sample.setSampleDimensions(value, value, value);
        renderWindow.render();
        setState({ ...state, ...obj });
        break;
      case "isoValue":
        value = obj.isoValue;
        mCubes.setContourValue(value);
        console.log(value);
        renderWindow.render();
        setState({ ...state, ...obj });
        break;
      case "sphereRadius":
        value = obj.sphereRadius;
        sphere.setRadius(value);  
        renderWindow.render();
        setState({ ...state, ...obj });
        break;
      case "computeNormals":
        value = obj.computeNormals;
        mCubes.setComputeNormals(!!value);
        renderWindow.render();
        setState({ ...state, ...obj });
        break;
      case "mergePoints":
        value = obj.mergePoints;
        mCubes.setMergePoints(!!value);
        renderWindow.render();
        setState({ ...state, ...obj });
        break;
      default:
        break;
    }
  };
  const createSphere = () => {
    const source = vtkSphereSource.newInstance();
    source.setCenter([0, 0, 0]);
    source.setThetaResolution(50);
    source.setRadius(1);
    const actor = vtkActor.newInstance();
    const mapper = vtkMapper.newInstance();

    actor.getProperty().setEdgeVisibility(true);
    actor.getProperty().setOpacity(0.3);
    context.current["sphereSource"] = source;
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

    const actor = vtkActor.newInstance();
    renderer.addActor(actor);

    const mapper = vtkMapper.newInstance();
    actor.setMapper(mapper);

    // Build pipeline
    const radius = 1;
    const sampleDimension = 50;
    const sphere = vtkSphere.newInstance({
      center: [0.0, 0.0, 0.0],
      radius: radius,
    });

    // value of implicit function 
    // x = x1 - center
    // x*x + y*y + z*z - R*R = value
    const sample = vtkSampleFunction.newInstance({
      implicitFunction: sphere,
      sampleDimensions: [sampleDimension, sampleDimension, sampleDimension],
      modelBounds: [-radius, radius, -radius, radius, -radius, radius],
    });
    // Create the isosurface by contourValue
    const mCubes = vtkImageMarchingCubes.newInstance({ contourValue: 0.0 });

    // Connect the pipeline proper
    mCubes.setInputConnection(sample.getOutputPort());
    mapper.setInputConnection(mCubes.getOutputPort());
    context.current = {
      sample,
      mCubes,
      sphere,
      renderer,
      renderWindow,
    };
    // 同步sphere
    const sphereActor = createSphere();
    renderer.addActor(sphereActor);

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
              <span>Volume resolution</span>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={state.volumeResolution}
                onChange={(e) => {
                  updateParam("volumeResolution", {
                    volumeResolution: Number(e.target.value),
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
                value={state.sphereRadius}
                onChange={(e) => {
                  updateParam("sphereRadius", {
                    sphereRadius: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Iso value</span>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.05"
                value={state.isoValue}
                onChange={(e) => {
                  updateParam("isoValue", {
                    isoValue: Number(e.target.value),
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Compute Normals</span>
              <input
                type="checkbox"
                value={state.computeNormals}
                onChange={(e) => {
                  updateParam("computeNormals", {
                    computeNormals: e.target.checked,
                  });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Merge Points</span>
              <input
                type="checkbox"
                value={state.mergePoints}
                onChange={(e) => {
                  updateParam("mergePoints", {
                    mergePoints: e.target.checked,
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

export default ImageMarchingCubes;
