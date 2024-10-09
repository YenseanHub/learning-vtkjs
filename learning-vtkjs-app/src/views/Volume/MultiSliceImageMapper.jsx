import React, { useState, useRef, useEffect } from "react";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Volume";

import macro from "@kitware/vtk.js/macros";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

// Force DataAccessHelper to have access to various data source
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper";
import "@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper";

import vtkHttpDataSetReader from "@kitware/vtk.js/IO/Core/HttpDataSetReader";
import vtkImageMapper from "@kitware/vtk.js/Rendering/Core/ImageMapper";
import vtkImageSlice from "@kitware/vtk.js/Rendering/Core/ImageSlice";
// own utils
import { BaseUrlPross } from "../Utils/UrlUtils";
function MultiSliceImageMapper() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  function updateColorLevel(imageActor, colorLevel) {
    imageActor.getProperty().setColorLevel(colorLevel);
  }

  function updateColorWindow(imageActor, colorLevel) {
    imageActor.getProperty().setColorWindow(colorLevel);
  }
  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const imageActorI = vtkImageSlice.newInstance();
    const imageActorJ = vtkImageSlice.newInstance();
    const imageActorK = vtkImageSlice.newInstance();
    renderer.addActor(imageActorK);
    renderer.addActor(imageActorJ);
    renderer.addActor(imageActorI);

    const reader = vtkHttpDataSetReader.newInstance({
      fetchGzip: true,
    });
    reader
      .setUrl(BaseUrlPross("data/volume/headsq.vti"), { loadData: true })
      .then(() => {
        const data = reader.getOutputData();
        const dataRange = data.getPointData().getScalars().getRange();
        const extent = data.getExtent();

        const imageMapperK = vtkImageMapper.newInstance();
        imageMapperK.setInputData(data);
        imageMapperK.setKSlice(30);
        imageActorK.setMapper(imageMapperK);

        const imageMapperJ = vtkImageMapper.newInstance();
        imageMapperJ.setInputData(data);
        imageMapperJ.setJSlice(30);
        imageActorJ.setMapper(imageMapperJ);

        const imageMapperI = vtkImageMapper.newInstance();
        imageMapperI.setInputData(data);
        imageMapperI.setISlice(30);
        imageActorI.setMapper(imageMapperI);

        renderer.resetCamera();
        renderer.resetCameraClippingRange();
        renderWindow.render();

        updateColorLevel(imageActorI, (dataRange[0] + dataRange[1]) / 3);
        updateColorWindow(imageActorK, dataRange[1]);
      });
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

export default MultiSliceImageMapper;
