import React from "react";
import { Card } from "antd";
import RecentTrack from "./RecentTrack";
import "./TrackCard.css";
export default function TrackCollection({ title, tracksToShow, chooseTrack }) {
  return (
    <Card
      style={{
        height: "500px",
        overflow: "hidden",
        backgroundColor: "#F7EDE4",
        // borderColor: "#2f4858",
        border: "none",
        boxShadow:
          "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
      }}
      className="playlist-card"
    >
      <h4 style={{ height: "80px", color: "#373634" }}>
        {title || "Test title"}
      </h4>
      <div style={{ height: "370px", overflow: "scroll" }}>
        {tracksToShow?.map((track) => (
          <RecentTrack
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
      </div>
    </Card>
  );
}
