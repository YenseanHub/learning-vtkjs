import React, { useState, useRef, useEffect } from "react";

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkXMLPolyDataReader from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkHttpDataAccessHelper from "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";

const { fetchBinary } = vtkHttpDataAccessHelper;
function TimeSeries() {
  const vtkContainerRef = useRef(null);
  const timeSeriesData = useRef(null);
  const context = useRef(null);

  const [timestep, setTimestep] = useState(0);
  const [timevalue, setTimevalue] = useState(0);
  function downloadTimeSeries() {
    const files = [
      "data/can/can_0.vtp",
      "data/can/can_5.vtp",
      "data/can/can_10.vtp",
      "data/can/can_15.vtp",
      "data/can/can_20.vtp",
      "data/can/can_25.vtp",
      "data/can/can_30.vtp",
      "data/can/can_35.vtp",
      "data/can/can_40.vtp",
    ];
    return Promise.all(
      files.map((filename) =>
        fetchBinary(BaseUrlPross(filename)).then((binary) => {
          const reader = vtkXMLPolyDataReader.newInstance();
          reader.parseAsArrayBuffer(binary);
          return reader.getOutputData(0);
        })
      )
    );
  }
  function updateParam(step) {
    const activeDataset = timeSeriesData.current[step];
    if (activeDataset) {
      setVisibleDataset(activeDataset);
      setTimevalue(getDataTimeStep(activeDataset));
      setTimestep(step);
    }
  }
  function getDataTimeStep(vtkObj) {
    const arr = vtkObj.getFieldData().getArrayByName("TimeValue");
    if (arr) {
      return arr.getData()[0];
    }
    return null;
  }

  function setVisibleDataset(ds) {
    const { mapper, renderer, renderWindow } = context.current;
    mapper.setInputData(ds);
    renderer.resetCamera();
    renderWindow.render();
  }

  useEffect(() => {
    // ----------------------------------------------------------------------------
    // Standard rendering code setup
    // ----------------------------------------------------------------------------

    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const mapper = vtkMapper.newInstance();
    mapper.setInputData(vtkPolyData.newInstance());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    renderer.addActor(actor);
    renderer.resetCamera();
    renderWindow.render();
    context.current = {
      renderer,
      renderWindow,
      mapper,
    };
    
    // -----------------------------------------------------------
    // example code logic
    // -----------------------------------------------------------

    timeSeriesData.current = [];

    downloadTimeSeries().then((downloadedData) => {
      timeSeriesData.current = downloadedData.filter(
        (ds) => getDataTimeStep(ds) !== null
      );
      timeSeriesData.current.sort(
        (a, b) => getDataTimeStep(a) - getDataTimeStep(b)
      );
      setTimestep(0);

      // set up camera
      renderer.getActiveCamera().setPosition(0, 55, -22);
      renderer.getActiveCamera().setViewUp(0, 0, -1);

      setVisibleDataset(timeSeriesData.current[0]);
      setTimevalue(getDataTimeStep(timeSeriesData.current[0]));
    });
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
            <td>
              <span>Time step:</span>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={timestep}
                onChange={(e) => {
                  updateParam(Number(e.target.value));
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Time value: </span>
              <span>{timevalue}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default TimeSeries;
