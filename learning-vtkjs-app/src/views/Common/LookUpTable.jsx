import React, { useState, useRef, useEffect } from "react";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import macro from "@kitware/vtk.js/macros";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkDataSet from "@kitware/vtk.js/Common/DataModel/DataSet";
import vtkLookupTable from "@kitware/vtk.js/Common/Core/LookupTable";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkWarpScalar from "@kitware/vtk.js/Filters/General/WarpScalar";

function LookupTable() {
  const vtkContainerRef = useRef(null);
  const [xResolution, setXResolution] = useState("50");
  const [yResolution, setYResolution] = useState("50");
  const [scaleFactor, setScaleFactor] = useState("1");
  const context = useRef(null);
  const { ColorMode, ScalarMode } = vtkMapper;
  const { FieldDataTypes } = vtkDataSet;

  useEffect(() => {
    // ----------------------------------------------------------------------------
    // Standard rendering code setup
    // ----------------------------------------------------------------------------

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0.9, 0.9, 0.9],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    // ----------------------------------------------------------------------------
    // Example code
    // ----------------------------------------------------------------------------

    const lookupTable = vtkLookupTable.newInstance({ hueRange: [1, 0] });
    lookupTable.setNumberOfColors(10);

    const planeSource = vtkPlaneSource.newInstance({
      xResolution: 25,
      yResolution: 25,
    });
    const planeMapper = vtkMapper.newInstance({
      interpolateScalarsBeforeMapping: false,
      colorMode: ColorMode.DEFAULT,
      scalarMode: ScalarMode.DEFAULT,
      useLookupTableScalarRange: false,
      lookupTable,
    });
    const planeActor = vtkActor.newInstance();
    planeActor.getProperty().setEdgeVisibility(true);

    const simpleFilter = vtkCalculator.newInstance();
    simpleFilter.setFormulaSimple(
      FieldDataTypes.POINT, // Generate an output array defined over points.
      [], // We don't request any point-data arrays because point coordinates are made available by default.
      "z", // Name the output array "z"
      (x) => x[0]
    ); // Our formula for z

    const warpScalar = vtkWarpScalar.newInstance();
    const warpMapper = vtkMapper.newInstance({
      interpolateScalarsBeforeMapping: false,
      useLookupTableScalarRange: false,
      lookupTable,
    });
    const warpActor = vtkActor.newInstance();
    // warpActor.getProperty().setEdgeVisibility(true);

    // The generated 'z' array will become the default scalars, so the plane mapper will color by 'z':
    simpleFilter.setInputConnection(planeSource.getOutputPort());

    // We will also generate a surface whose points are displaced from the plane by 'z':
    warpScalar.setInputConnection(simpleFilter.getOutputPort());
    warpScalar.setInputArrayToProcess(0, "z", "PointData", "Scalars");

    planeMapper.setInputConnection(simpleFilter.getOutputPort());
    planeActor.setMapper(planeMapper);

    warpMapper.setInputConnection(warpScalar.getOutputPort());
    warpActor.setMapper(warpMapper);
    warpActor.getProperty().setEdgeVisibility(true);
    renderer.addActor(planeActor);
    renderer.addActor(warpActor);

    renderer.resetCamera();
    renderWindow.render();
    context.current = {
      _self: this,
      fullScreenRenderer,
      renderWindow,
      renderer,
      planeSource,
      planeMapper,
      planeActor,
      simpleFilter,
      warpMapper,
      warpScalar,
      warpActor,
      lookupTable,
    };
    // Eecompute scalar range
    // applyFormula();
  }, []);
  function updateResolution(e, propertyName) {
    const { planeSource, renderWindow } = context.current;
    const value = Number(e.target.value);
    planeSource.set({ [propertyName]: value });
    if (propertyName.indexOf("x") > -1) {
      setXResolution(value);
    } else if (propertyName.indexOf("y") > -1) {
      setYResolution(value);
    }
    renderWindow.render();
  }
  function updateScaleFactor(e, propertyName) {
    const { warpScalar, renderWindow } = context.current;
    const value = Number(e.target.value);
    warpScalar.set({ [propertyName]: value });
    setScaleFactor(value);
    renderWindow.render();
  }

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
        }}
      >
        <tbody>
          <tr>
            <td>X Resolution</td>
            <td>
              <input
                className="xResolution"
                type="range"
                min="2"
                max="100"
                step="1"
                value={xResolution}
                onChange={(e) => {
                  updateResolution(e, "xResolution");
                }}
              />
            </td>
          </tr>
          <tr>
            <td>Y Resolution</td>
            <td>
              <input
                className="yResolution"
                type="range"
                min="2"
                max="100"
                step="1"
                value={yResolution}
                onChange={(e) => {
                  updateResolution(e, "yResolution");
                }}
              />
            </td>
          </tr>
          <tr>
            <td>Displacement Scale</td>
            <td>
              <input
                className="scaleFactor"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={scaleFactor}
                onChange={(e) => {
                  updateScaleFactor(e, "scaleFactor");
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default LookupTable;
