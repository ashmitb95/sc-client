import React from "react";
import TrackCollection from "./TrackCollection";
import { Col, Row } from "antd";

const TabContent = ({ title, contentList, chooseTrack }) => {
  return (
    <div>
      <Row>
        <h1 fontSize={34}>{title}</h1>
      </Row>
      {/* <Row gutter={[40, 0]} justify={"center"} className="scrolling-wrapper"> */}
      <div className="scrolling-wrapper">
        {contentList.map((tracksToShow) => {
          const { label, tracks } = tracksToShow;
          return (
            <>
              {/* <Col span={8} style={{ margin: "auto 80px" }}> */}
              <TrackCollection
                // title={"Some of your most recent songs"}
                title={label}
                tracksToShow={tracks}
                chooseTrack={chooseTrack}
              />
              {/* </Col> */}
            </>
          );
        })}
      </div>

      {/* <div className="scrolling-wrapper">
          {artistTracks.map((artist) => {
            return (
              <div className="card">
                <TrackCollection
                  title={artist.artist.name}
                  tracksToShow={artist.tracks}
                  chooseTrack={chooseTrack}
                />
              </div>
            );
          })} */}

      {/* <Col span={8} style={{ margin: "auto 80px" }}>
          <TrackCollection
            title="Some recommendations based on your recent songs"
            tracksToShow={recommendedTracks}
            chooseTrack={chooseTrack}
          />
        </Col> */}
      {/* </Row> */}
    </div>
  );
};

export default TabContent;
