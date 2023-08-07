import React from "react";
import { Card } from "antd";
import RecentTrack from "./RecentTrack";
export default function TrackCollection({ title, tracksToShow, chooseTrack }) {
  return (
    <Card
      style={{
        height: "500px",
        overflow: "hidden",
        border: "none",
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
