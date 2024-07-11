import React from "react";
import { routers } from "../routes/root";
import "./Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  const dataList = routers.filter(
    (route) => route.path !== "/" && route.path !== "*"
  );
  return (
    <div className="main-container">
      {dataList.map((route, key) => {
        return (
          <Link
            key={key}
            className="example-card"
            to={route.path}
            target="_blank"
          >
            <img className="example-img" src={route.url} alt="" />
            <span>{route.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
