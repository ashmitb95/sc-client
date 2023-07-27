import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import { Row, Col, Card } from "antd";
import TrackSearchResult from "./TrackSearchResult";
import RecentTrack from "./RecentTrack";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import "./index.css";

const spotifyApi = new SpotifyWebApi({
  clientId: "128a94262ba742d2aba73d3a6c264a48",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [recentTracks, setRecentTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [trackIDs, setTrackIDs] = useState([]);
  const [images, setImages] = useState([]);

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  useEffect(() => {
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi
      .searchTra1cks(search)
      .then((res) => {
        if (cancel) return;
        setSearchResults(
          res.body.tracks.items.map((track) => {
            const smallestAlbumImage = track.album.images.reduce(
              (smallest, image) => {
                if (image.height < smallest.height) return image;
                return smallest;
              },
              track.album.images[0]
            );

            return {
              artist: track.artists?.[0].name,
              title: track.name,
              uri: track.uri,
              albumUrl: smallestAlbumImage.url,
            };
          })
        );
      })
      .catch((err) => {
        debugger;
        console.error(err);
      });

    return () => (cancel = true);
  }, [search, accessToken]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !trackIDs.length) return;

    console.log(trackIDs);

    axios
      .post(
        "http://localhost:3001/recommend",
        { trackIDs: trackIDs.join(",") },
        {
          params: {
            accessToken: token,
          },
        }
      )
      .then((res) => {
        // debugger;

        setRecommendedTracks(res.data.tracks);

        setImages((state) => [
          ...state,
          res?.data?.map((track) => track?.album.images?.[0]?.url),
        ]);
        // const trackIDs = res?.data?.tracks?.map((item) => item.id) || {};
        // setTrackIDs(trackIDs);
      });
  }, [trackIDs]);

  useEffect(() => {
    if (!accessToken) return;
    const token = localStorage.getItem("authToken");
    // spotifyApi.setAccessToken(accessToken);
    console.log("calling recents api for tracks");
    const recentType = "tracks";

    axios
      .get(`http://localhost:3001/recent/${recentType}`, {
        params: {
          accessToken: accessToken,
        },
      })
      .then((res) => {
        console.log("recent tracks", res.data);
        setRecentTracks(res.data);
        const trackIDs = res?.data?.map((item) => item.id) || {};
        setTrackIDs(trackIDs);

        setImages((state) => [
          ...state,
          res?.data?.map((track) => track?.album.images?.[0]?.url),
        ]);
      })
      .catch((err) => {
        debugger;
        console.error(err);
      });
  }, [accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
        {/* {searchResults.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )} */}
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Card style={{ height: "300px", overflow: "scroll" }}>
              {recentTracks?.map((track) => (
                <RecentTrack
                  track={track}
                  key={track.uri}
                  chooseTrack={chooseTrack}
                />
              ))}
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ height: "300px", overflow: "scroll" }}>
              {recommendedTracks?.map((track) => (
                <RecentTrack
                  track={track}
                  key={track.uri}
                  chooseTrack={chooseTrack}
                />
              ))}
            </Card>
          </Col>
        </Row>
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
      <div className="background">
        <div className="background-container">
          <Row>
            {images.map((item) => {
              debugger;
              return (
                <Col>
                  <Card style={{ height: "155px", width: "155px" }}>
                    <img
                      src={item}
                      style={{ height: "155px", width: "155px" }}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    </Container>
  );
}
