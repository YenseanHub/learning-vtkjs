import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkTexture from "@kitware/vtk.js/Rendering/Core/Texture";
import vtkRTAnalyticSource from "@kitware/vtk.js/Filters/Sources/RTAnalyticSource";
import vtkImageSliceFilter from "@kitware/vtk.js/Filters/General/ImageSliceFilter";
import vtkScalarToRGBA from "@kitware/vtk.js/Filters/General/ScalarToRGBA";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";

function ScalarToRGBA() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [sliceIndex, setSliceIndex] = useState(0);
  const updateParam = (sliceIndex) => {
    const { sliceFilter, texture, renderWindow } = context.current;
    setSliceIndex(sliceIndex);
    sliceFilter.setSliceIndex(sliceIndex);
    texture.modified();
    renderWindow.render();
  };

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const dataRange = [45, 183];
    const lookupTable = vtkColorTransferFunction.newInstance();
    const preset = vtkColorMaps.getPresetByName("rainbow");
    lookupTable.applyColorMap(preset);
    lookupTable.setMappingRange(...dataRange);
    lookupTable.updateRange();

    const piecewiseFunction = vtkPiecewiseFunction.newInstance();
    piecewiseFunction.removeAllPoints();
    piecewiseFunction.addPoint(dataRange[0], 0);
    piecewiseFunction.addPoint((dataRange[0] + dataRange[1]) * 0.5, 0.1);
    piecewiseFunction.addPoint(dataRange[1], 1);

    const wavelet = vtkRTAnalyticSource.newInstance();
    const actor = vtkActor.newInstance();
    const mapper = vtkMapper.newInstance();

    const sliceFilter = vtkImageSliceFilter.newInstance({ sliceIndex: 10 });
    sliceFilter.setInputConnection(wavelet.getOutputPort());

    const rgbaFilter = vtkScalarToRGBA.newInstance();
    rgbaFilter.setLookupTable(lookupTable);
    rgbaFilter.setPiecewiseFunction(piecewiseFunction);
    rgbaFilter.setInputConnection(sliceFilter.getOutputPort());

    const texture = vtkTexture.newInstance();
    texture.setInputConnection(rgbaFilter.getOutputPort());

    const planeSource = vtkPlaneSource.newInstance();
    mapper.setInputConnection(planeSource.getOutputPort());
    actor.setMapper(mapper);
    actor.addTexture(texture);

    renderer.addActor(actor);
    context.current = {
      sliceFilter,
      texture,
      renderWindow,
    };
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
              <span>sliceIndex</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={sliceIndex}
                onChange={(e) => {
                  updateParam(Number(e.target.value));
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ScalarToRGBA;
