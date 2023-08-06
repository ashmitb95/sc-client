import React from "react";

// import "./TrackCard.css"; // Import the CSS file for styling
export default function RecentTrack({ track, chooseTrack }) {
  function handlePlay() {
    chooseTrack(track);
  }

  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer", backgroundColor: "#1A1E1F" }}
      onClick={handlePlay}
    >
      <img
        src={track?.album.images?.[0]?.url}
        style={{ height: "64px", width: "64px" }}
      />
      <div className="ml-3">
        <div style={{ color: "#FFF" }}>{track.name}</div>
        <div style={{ color: "#FFF", opacity: 0.5 }}>
          {track.artists[0]?.name}
        </div>
      </div>
    </div>

    // <div className="track-card">
    //   <img
    //     src={track?.album.images?.[0]?.url}
    //     alt="Track Thumbnail"
    //     // className="thumbnail"
    //   />
    //   <div className="details">
    //     <h3 className="track-name">{track.name}</h3>
    //     <p className="artist-name">{track.artists[0]?.name}</p>
    //   </div>
    // </div>
  );
}

/**
 * 
 * 
 *     <div className="track-card">
      <img
        src={track?.album.images?.[0]?.url}
        alt="Track Thumbnail"
        className="thumbnail"
      />
      <div className="details">
        <h3 className="track-name">{track.name}</h3>
        <p className="artist-name">{track.artists[0]?.name}</p>
      </div>
    </div>
 */
