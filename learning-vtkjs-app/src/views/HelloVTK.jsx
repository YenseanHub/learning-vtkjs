import React, { useState, useRef, useEffect } from "react";
import Viewer from "../vtkView/Viewer";

function HelloVTK() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [coneResolution, setConeResolution] = useState(6);
  const [representation, setRepresentation] = useState(2);

  useEffect(() => {
    if (!context.current) {
      let viewer3D = new Viewer(vtkContainerRef.current);
      viewer3D.init();
      viewer3D.addCone();
      context.current = {
        viewer3D,
      };
    }

    return () => {
      if (context.current) {
        context.current.viewer3D.destory();
        context.current = null;
      }
    };
  }, [vtkContainerRef]);

  useEffect(() => {
    // if (context.current) {
    //   const { coneSource, renderWindow } = context.current;
    //   // coneSource.setResolution(coneResolution);
    //   renderWindow.render();
    // }
  }, [coneResolution]);

  useEffect(() => {
    // if (context.current) {
    //   const { actor, renderWindow } = context.current;
    //   actor.getProperty().setRepresentation(representation);
    //   renderWindow.render();
    // }
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

export default HelloVTK;
