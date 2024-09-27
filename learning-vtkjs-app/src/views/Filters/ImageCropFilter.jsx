import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Volume";

// Force the loading of HttpDataAccessHelper to support gzip decompression
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";

import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkHttpDataSetReader from "@kitware/vtk.js/IO/Core/HttpDataSetReader";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkImageCropFilter from "@kitware/vtk.js/Filters/General/ImageCropFilter";
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";
function ImageCropFilter() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    IMax: 0,
    IMin: 0,
    JMax: 0,
    JMin: 0,
    KMax: 0,
    KMin: 0,
  });
  const updateCroppingPlanes = (obj) => {
    const { cropFilter, renderWindow } = context.current;
    let newObj = {
      ...state,
      ...obj,
    };
    cropFilter.setCroppingPlanes(...Object.values(newObj));
    setState(newObj);
    renderWindow.render();
  };
  const GetModel = async () => {
    const { reader, actor, renderer, cropFilter, renderWindow } =
      context.current;
    reader.setUrl(BaseUrlPross("data/volume/headsq.vti")).then(() => {
      reader.loadData().then(() => {
        renderer.addVolume(actor);

        const data = reader.getOutputData();
        // [0, 63, 0, 63, 0, 92]
        const extent = data.getExtent();
        setState({
          IMin: extent[0],
          IMax: extent[1],
          JMin: extent[2],
          JMax: extent[3],
          KMin: extent[4],
          KMax: extent[5],
        });
        cropFilter.setCroppingPlanes(...extent);

        context.current = {
          ...context.current,
          data,
        };

        const interactor = renderWindow.getInteractor();
        interactor.setDesiredUpdateRate(15.0);
        renderer.resetCamera();
        renderWindow.render();
      });
    });
  };

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    // create filter
    const cropFilter = vtkImageCropFilter.newInstance();

    const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });

    const actor = vtkVolume.newInstance();
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setSampleDistance(1.1);
    actor.setMapper(mapper);

    // create color and opacity transfer functions
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
    ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
    ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
    ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(0.0, 0.0);
    ofun.addPoint(255.0, 1.0);
    actor.getProperty().setRGBTransferFunction(0, ctfun);
    actor.getProperty().setScalarOpacity(0, ofun);
    actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setUseGradientOpacity(0, true);
    actor.getProperty().setGradientOpacityMinimumValue(0, 2);
    actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
    actor.getProperty().setGradientOpacityMaximumValue(0, 20);
    actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
    actor.getProperty().setShade(true);
    actor.getProperty().setAmbient(0.2);
    actor.getProperty().setDiffuse(0.7);
    actor.getProperty().setSpecular(0.3);
    actor.getProperty().setSpecularPower(8.0);

    cropFilter.setInputConnection(reader.getOutputPort());
    mapper.setInputConnection(cropFilter.getOutputPort());

    context.current = {
      reader,
      actor,
      cropFilter,
      renderer,
      renderWindow,
    };
    GetModel();
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
        <tbody>
          <tr>
            <td>I: </td>
            <td>
              <span>IMin</span>
              <input
                type="range"
                min="0"
                max="63"
                step="1"
                value={state.IMin}
                onChange={(e) => {
                  updateCroppingPlanes({ IMin: e.target.value });
                }}
              />
            </td>
            <td>
              <span>IMax</span>
              <input
                type="range"
                min="0"
                max="63"
                step="1"
                value={state.IMax}
                onChange={(e) => {
                  updateCroppingPlanes({ IMax: e.target.value });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>J: </td>
            <td>
              <span>JMin</span>
              <input
                type="range"
                min="0"
                max="63"
                step="1"
                value={state.JMin}
                onChange={(e) => {
                  updateCroppingPlanes({ JMin: e.target.value });
                }}
              />
            </td>
            <td>
              <span>JMax</span>
              <input
                type="range"
                min="0"
                max="63"
                step="1"
                value={state.JMax}
                onChange={(e) => {
                  updateCroppingPlanes({ JMax: e.target.value });
                }}
              />
            </td>
          </tr>
          <tr>
            <td>K: </td>
            <td>
              <span>KMin</span>
              <input
                type="range"
                min="0"
                max="63"
                step="1"
                value={state.KMin}
                onChange={(e) => {
                  updateCroppingPlanes({ KMin: e.target.value });
                }}
              />
            </td>
            <td>
              <span>KMax</span>
              <input
                type="range"
                min="0"
                max="92"
                step="1"
                value={state.KMax}
                onChange={(e) => {
                  updateCroppingPlanes({ KMax: e.target.value });
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ImageCropFilter;
