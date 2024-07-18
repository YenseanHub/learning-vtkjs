import React, { useState, useRef, useEffect } from "react";
import Viewer from "../vtkView/Viewer";

function VTKSource() {
  const vtkContainerRef = useRef(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);
  let viewer3D = useRef(null);

  useEffect(() => {
    if (!viewer3D.current) {
      viewer3D.current = new Viewer(vtkContainerRef.current);
      viewer3D.current.init();
      // 添加一个锥体
      viewer3D.current.addCone();
      // 添加一个圆形
      viewer3D.current.addCircle();
      viewer3D.current.resetCamera();
      // 添加一个箭头
      viewer3D.current.addArrow();
      // 添加一个同心圆
      viewer3D.current.addConcentricCylinder();
      // 添加一个方形
      viewer3D.current.addCube();
      // 包围盒
      viewer3D.current.addCursor3D();
      // 圆柱体
      viewer3D.current.addCylinder();
      // 线
      viewer3D.current.addLine();
      // 平面
      viewer3D.current.addPlane();
      // 点
      viewer3D.current.addPoint();
      // 球
      viewer3D.current.addSphere();
    }

    return () => {
      if (viewer3D.current) {
        viewer3D.current.destory();
        viewer3D.current = null;
      }
    };
  }, [vtkContainerRef]);
  // 设置精度
  // useEffect(() => {
  //   if (viewer3D.current) {
  //     viewer3D.current.setAllResolution(coneResolution);
  //     viewer3D.current.render();
  //   }
  // }, [coneResolution]);

  useEffect(() => {
    if (viewer3D.current) {
      viewer3D.current.setAllRepresentation(representation);
      viewer3D.current.render();
    }
  }, [representation]);

  return (
    <div>
      <div
        ref={vtkContainerRef}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
      <table
        style={{
          position: "absolute",
          top: "25px",
          left: "25px",
          background: "white",
          padding: "12px",
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={representation}
                style={{ width: "100%" }}
                onInput={(ev) => setRepresentation(Number(ev.target.value))}
              >
                <option value="0">Points</option>
                <option value="1">Wireframe</option>
                <option value="2">Surface</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type="range"
                min="4"
                max="80"
                value={coneResolution}
                onChange={(ev) => setConeResolution(Number(ev.target.value))}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default VTKSource;
