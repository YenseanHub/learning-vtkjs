import React, { useState, useRef, useEffect } from "react";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";

import vtkArrowSource from "@kitware/vtk.js/Filters/Sources/ArrowSource";
import vtkOBBTree from "@kitware/vtk.js/Filters/General/OBBTree";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import vtkTriangleFilter from "@kitware/vtk.js/Filters/General/TriangleFilter";
import vtkTubeFilter from "@kitware/vtk.js/Filters/General/TubeFilter";

function OBBTree() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);

  function render(mesh, userMatrix = null) {
    const mapper = vtkMapper.newInstance();
    mapper.setInputData(mesh);
    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    if (userMatrix) {
      actor.setUserMatrix(userMatrix);
    }
    return actor;
  }
  function addMesh(mesh, userMatrix, triangulate = false) {
    const { renderer } = context.current;
    const obbTree = vtkOBBTree.newInstance();
    if (triangulate) {
      const triangleFilter = vtkTriangleFilter.newInstance();
      triangleFilter.setInputData(mesh);
      triangleFilter.update();
      obbTree.setDataset(triangleFilter.getOutputData());
    } else {
      obbTree.setDataset(mesh);
    }
    obbTree.buildLocator();
  
    const meshActor = render(mesh, userMatrix);
    renderer.addActor(meshActor);
    
    const obb = obbTree.generateRepresentation(0);
    const obbActor = render(obb, userMatrix);
    renderer.addActor(obbActor);
    obbActor.getProperty().setOpacity(0.3);
    obbActor.getProperty().setEdgeVisibility(1);
  
    return obbTree;
  }
  function showAndIntersect(mesh1, mesh2, triangulate = false) {
    const { renderer, renderWindow } = context.current;
    const obbTree1 = addMesh(mesh1, null, triangulate);
    const obbTree2 = addMesh(mesh2, null, triangulate);
    
    const intersection = {
      obbTree1: obbTree2,
      intersectionLines: vtkPolyData.newInstance(),
    };
    const intersect = obbTree1.intersectWithOBBTree(
      obbTree2,
      null,
      obbTree1.findTriangleIntersections.bind(null, intersection)
    );
    console.log("obbs are intersected : ", intersect);
    const tubeFilter = vtkTubeFilter.newInstance();
    tubeFilter.setInputData(intersection.intersectionLines);
    tubeFilter.setRadius(0.01);
    tubeFilter.update();
    const intesectionActor = render(tubeFilter.getOutputData());
    renderer.addActor(intesectionActor);
    
    intesectionActor.getProperty().setColor(1, 0, 0);
    intesectionActor.getMapper().setResolveCoincidentTopologyToPolygonOffset();
    intesectionActor
      .getMapper()
      .setResolveCoincidentTopologyLineOffsetParameters(-1, -1);

    renderer.resetCamera();
    renderer.resetCameraClippingRange();
    renderWindow.render();
  }

  useEffect(() => {
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      background: [0, 0, 0],
      rootContainer: vtkContainerRef.current,
    });
    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();
    context.current = {
      renderer,
      renderWindow,
    };

    const source1 = vtkArrowSource.newInstance({ direction: [1, 0, 0] });
    source1.update();
    const source2 = vtkArrowSource.newInstance({ direction: [0, 1, 1] });
    source2.update();
    showAndIntersect(source1.getOutputData(), source2.getOutputData(), true);
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

export default OBBTree;
