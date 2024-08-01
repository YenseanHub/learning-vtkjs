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
import vtkPoints from "@kitware/vtk.js/Common/Core/Points";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import vtkWarpScalar from "@kitware/vtk.js/Filters/General/WarpScalar";
let formulaIdx = 0;

function Calculator() {
  const vtkContainerRef = useRef(null);
  const [xResolution, setXResolution] = useState("50");
  const [yResolution, setYResolution] = useState("50");
  const [scaleFactor, setScaleFactor] = useState("1");
  const [visible, setVisible] = useState(true);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1);
  const context = useRef(null);
  const { ColorMode, ScalarMode } = vtkMapper;
  const { FieldDataTypes } = vtkDataSet;
  const { vtkErrorMacro } = macro;

  const FORMULA = [
    "((x[0] - 0.5) * (x[0] - 0.5)) + ((x[1] - 0.5) * (x[1] - 0.5)) + 0.125",
    "0.25 * Math.sin(Math.sqrt(((x[0] - 0.5) * (x[0] - 0.5)) + ((x[1] - 0.5) * (x[1] - 0.5)))*50)",
  ];
  const [formula, setFormula] = useState(FORMULA[formulaIdx]);
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

    const lookupTable = vtkLookupTable.newInstance({ hueRange: [0, 0.667] });

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
      (x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
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
  function updateVisibility() {
    const { planeActor, renderWindow } = context.current;
    let _status = !visible;
    planeActor.setVisibility(_status);
    setVisible(_status);
    renderWindow.render();
  }
  function updateScalarRange(minValue, maxValue) {
    const { lookupTable, renderWindow } = context.current;
    const min = Number(minValue);
    const max = Number(maxValue);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      lookupTable.setMappingRange(min, max);
      setMinValue(min);
      setMaxValue(max);
      renderWindow.render();
    }
  }
  function updateNext() {
    const { renderWindow } = context.current;
    formulaIdx = (formulaIdx + 1) % FORMULA.length;
    setFormula(FORMULA[formulaIdx]);
    applyFormula();
    renderWindow.render();
  }
  function applyFormula() {
    const { planeSource, simpleFilter, lookupTable, renderWindow } =
      context.current;
    const el = document.querySelector(".formula");
    let fn = null;
    try {
      fn = new Function("x,y", `return ${formula}`);
    } catch (exc) {
      if (!("name" in exc && exc.name === "SyntaxError")) {
        vtkErrorMacro(`Unexpected exception ${exc}`);
        el.style.background = "#fbb";
        return;
      }
    }
    if (fn) {
      el.style.background = "#fff";
      const formulaObj = simpleFilter.createSimpleFormulaObject(
        FieldDataTypes.POINT,
        [],
        "z",
        fn
      );

      // See if the formula is actually valid by invoking "formulaObj" on
      // a dataset containing a single point.
      planeSource.update();
      let outputData = planeSource.getOutputData();
      const arraySpec = formulaObj.getArrays([outputData]);
      const testData = vtkPolyData.newInstance();
      const testPts = vtkPoints.newInstance({
        name: "coords",
        numberOfComponents: 3,
        size: 3,
        values: [0, 0, 0],
      });
      testData.setPoints(testPts);
      const testOut = vtkPolyData.newInstance();
      testOut.shallowCopy(testData);
      const testArrays = simpleFilter.prepareArrays(
        arraySpec,
        testData,
        testOut
      );
      try {
        formulaObj.evaluate(testArrays.arraysIn, testArrays.arraysOut);

        // We evaluated 1 point without exception... it's safe to update the
        // filter and re-render.
        simpleFilter.setFormula(formulaObj);

        simpleFilter.update();

        // Update UI with new range
        const [min, max] = simpleFilter
          .getOutputData()
          .getPointData()
          .getScalars()
          .getRange();
        setMinValue(min);
        setMaxValue(max);
        lookupTable.setMappingRange(min, max);

        renderWindow.render();
        return;
      } catch (exc) {
        vtkErrorMacro(`Unexpected exception ${exc}`);
      }
    }
    el.style.background = "#ffb";
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
          <tr>
            <td>Plane Visibility</td>
            <td>
              <input
                className="visibility"
                type="checkbox"
                checked={visible}
                onChange={updateVisibility}
              />
            </td>
          </tr>
          <tr>
            <td>Formula</td>
            <td
              className="next"
              style={{
                cursor: "pointer",
                textAlign: "right",
              }}
              onClick={updateNext}
            >
              ...
            </td>
          </tr>
          <tr>
            <td colSpan="2">
              <input
                className="formula"
                type="text"
                style={{ width: "100%" }}
                value={formula}
                onChange={applyFormula}
              />
            </td>
          </tr>
          <tr>
            <td>Scalar range</td>
          </tr>
          <tr>
            <td>
              <input
                className="min"
                type="text"
                style={{ width: "100%" }}
                value={minValue}
                onChange={(e) => updateScalarRange(e.target.value, maxValue)}
              />
            </td>
            <td>
              <input
                className="max"
                type="text"
                style={{ width: "100%" }}
                value={maxValue}
                onChange={(e) => updateScalarRange(minValue, e.target.value)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Calculator;
