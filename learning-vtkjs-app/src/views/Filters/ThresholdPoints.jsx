import React, { useState, useRef, useEffect } from "react";

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/Rendering/Profiles/Glyph';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkThresholdPoints from '@kitware/vtk.js/Filters/Core/ThresholdPoints';
import vtkCalculator from '@kitware/vtk.js/Filters/General/Calculator';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";
function ThresholdPoints() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const { ColorMode, ScalarMode } = vtkMapper;
  const [thresholdArray, setThresholdArray] = useState("sine wave");
  const [thresholdOperation, setThresholdOperation] = useState("Above");
  const [thresholdValue, setThresholdValue] = useState({
    min: -5,
    max: 5,
    step: 1,
    value: 0,
  });
  function updateCriterias(arrayName, operation, value) {
    if (arrayName != null) {
      if (arrayName === 'x' || arrayName === 'y') {
        setThresholdValue({
          min : -5,
          max : 5,
          step : 1,
          value : 0,
        })
        
      } else if (arrayName === 'z') {
        setThresholdValue({
          min : -2,
          max : 2,
          step : 0.1,
          value : 0,
        })
      } else {
        setThresholdValue({
          min : 0,
          max : 256,
          step : 10,
          value : 30,
        })
      }
      setThresholdArray(arrayName);
    }
    if (operation != null) {
      setThresholdOperation(operation)
    }
    if (value != null) {
      setThresholdValue(value)
    }
    context.current.thresholder.setCriterias([
      {
        arrayName,
        fieldAssociation: arrayName === 'sine wave' ? 'PointData' : 'Points',
        operation,
        value: Number(value),
      },
    ]);
    context.current.renderWindow.render();
  }
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

    const lookupTable = vtkLookupTable.newInstance({ hueRange: [0.666, 0] });
    const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
    reader.setUrl(BaseUrlPross("/data/cow.vtp")).then(() => {
      reader.loadData().then(() => {
        renderer.resetCamera();
        renderWindow.render();
      });
    });

    const calc = vtkCalculator.newInstance();
    calc.setInputConnection(reader.getOutputPort());
    calc.setFormula({
      getArrays: (inputDataSets) => ({
        input: [{ location: FieldDataTypes.COORDINATE }], // Require point coordinates as input
        output: [
          // Generate two output arrays:
          {
            location: FieldDataTypes.POINT, // This array will be point-data ...
            name: 'sine wave', // ... with the given name ...
            dataType: 'Float64Array', // ... of this type ...
            attribute: AttributeTypes.SCALARS, // ... and will be marked as the default scalars.
          },
          {
            location: FieldDataTypes.UNIFORM, // This array will be field data ...
            name: 'global', // ... with the given name ...
            dataType: 'Float32Array', // ... of this type ...
            numberOfComponents: 1, // ... with this many components ...
            tuples: 1, // ... and this many tuples.
          },
        ],
      }),
      evaluate: (arraysIn, arraysOut) => {
        // Convert in the input arrays of vtkDataArrays into variables
        // referencing the underlying JavaScript typed-data arrays:
        const [coords] = arraysIn.map((d) => d.getData());
        const [sine, glob] = arraysOut.map((d) => d.getData());

        // Since we are passed coords as a 3-component array,
        // loop over all the points and compute the point-data output:
        for (let i = 0, sz = coords.length / 3; i < sz; ++i) {
          const dx = coords[3 * i] - 0.5;
          const dy = coords[3 * i + 1] - 0.5;
          sine[i] = 10 * dx * dx + dy * dy;
        }
        // Use JavaScript's reduce method to sum the output
        // point-data array and set the uniform array's value:
        glob[0] = sine.reduce((result, value) => result + value, 0);
        // Mark the output vtkDataArray as modified
        arraysOut.forEach((x) => x.modified());
      },
    });

    const mapper = vtkMapper.newInstance({
      interpolateScalarsBeforeMapping: true,
      colorMode: ColorMode.DEFAULT,
      scalarMode: ScalarMode.DEFAULT,
      useLookupTableScalarRange: true,
      lookupTable,
    });
    const actor = vtkActor.newInstance();
    actor.getProperty().setEdgeVisibility(true);

    const scalarBarActor = vtkScalarBarActor.newInstance();
    scalarBarActor.setScalarsToColors(lookupTable);
    renderer.addActor(scalarBarActor);

    const thresholder = vtkThresholdPoints.newInstance();
    thresholder.setInputConnection(calc.getOutputPort());

    mapper.setInputConnection(thresholder.getOutputPort());
    actor.setMapper(mapper);
    renderer.addActor(actor);

        context.current = {
          renderer,
          renderWindow,
          mapper,
          thresholder,
        };
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
          zIndex: 8,
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
            <td >
              <span>Arrays to threshold</span>
              <select
                value={thresholdArray}
                style={{ width: "50%" }}
                onChange={(e) => {
                  updateCriterias(e.target.value, null , null);
                }}>
                <option value="sine wave">sine wave</option>
                <option value="x">x</option>
                <option value="y">y</option>
                <option value="z">z</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <span>Operation</span>
              <select
                value={thresholdOperation}
                style={{ width: "100%" }}
                onChange={(e) => {
                  updateCriterias(null, e.target.value, null);
                }}>
                <option value="Above">&lt;</option>
                <option value="Below">&gt;</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <span>Threshold value:</span>
              <input
                type="number"
                min={thresholdValue.min}
                max={thresholdValue.max}
                step={thresholdValue.step}
                value={thresholdValue.value}
                onChange={(e) => {
                  updateCriterias(null, null, Number(e.target.value));
                }}
              />
            </td>
          </tr>
        
        </tbody>
      </table>
    </div>
  );
}

export default ThresholdPoints;
