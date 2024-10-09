import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/Profiles/Glyph";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkArrowSource from "@kitware/vtk.js/Filters/Sources/ArrowSource";
import vtkCubeSource from "@kitware/vtk.js/Filters/Sources/CubeSource";
import vtkLookupTable from "@kitware/vtk.js/Common/Core/LookupTable";
import vtkGlyph3DMapper from "@kitware/vtk.js/Rendering/Core/Glyph3DMapper";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPolyDataNormals from "@kitware/vtk.js/Filters/Core/PolyDataNormals";
function PolyDataNormals() {
  const { ColorMode, ScalarMode } = vtkMapper;
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [state, setState] = useState({
    computePointNormals: true,
    computeCellNormals: false,
  });
  const updateParam = (type, checked) => {
    const { polyDataNormals, renderWindow } = context.current;
    switch (type) {
      case "computePointNormals":
        polyDataNormals.setComputePointNormals(checked);
        setState({
          ...state,
          computePointNormals: checked,
        });
        break;
      case "computeCellNormals":
        polyDataNormals.setComputeCellNormals(checked);
        setState({
          ...state,
          computeCellNormals: checked,
        });
        break;
      default:
        break;
    }
    renderWindow.render();
  };

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    const lookupTable = vtkLookupTable.newInstance({ hueRange: [0.666, 0] });

    const source = vtkCubeSource.newInstance();
    const inputPolyData = source.getOutputData();
    inputPolyData.getPointData().setNormals(null);

    const mapper = vtkMapper.newInstance({
      interpolateScalarsBeforeMapping: true,
      colorMode: ColorMode.DEFAULT,
      scalarMode: ScalarMode.DEFAULT,
      useLookupTableScalarRange: true,
      lookupTable,
    });
    const actor = vtkActor.newInstance();
    actor.getProperty().setEdgeVisibility(true);

    const polyDataNormals = vtkPolyDataNormals.newInstance();

    // The generated 'z' array will become the default scalars, so the plane mapper will color by 'z':
    polyDataNormals.setInputData(inputPolyData);

    mapper.setInputConnection(polyDataNormals.getOutputPort());
    actor.setMapper(mapper);

    renderer.addActor(actor);

    const arrowSource = vtkArrowSource.newInstance();

    const glyphMapper = vtkGlyph3DMapper.newInstance();
    glyphMapper.setInputConnection(polyDataNormals.getOutputPort());
    glyphMapper.setSourceConnection(arrowSource.getOutputPort());
    glyphMapper.setOrientationModeToDirection();
    glyphMapper.setOrientationArray("Normals");
    glyphMapper.setScaleModeToScaleByMagnitude();
    glyphMapper.setScaleArray("Normals");
    glyphMapper.setScaleFactor(0.1);

    const glyphActor = vtkActor.newInstance();
    glyphActor.setMapper(glyphMapper);
    renderer.addActor(glyphActor);
    context.current = {
      renderer,
      renderWindow,
      polyDataNormals,
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
              <span>Compute point normals</span>
              <input
                type="checkbox"
                checked={state.computePointNormals}
                onChange={(e) => {
                  updateParam("computePointNormals", e.target.checked);
                }}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>Compute cell normals</span>
              <input
                type="checkbox"
                checked={state.computeCellNormals}
                onChange={(e) => {
                  updateParam("computeCellNormals", e.target.checked);
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PolyDataNormals;
