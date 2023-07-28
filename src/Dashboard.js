import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import { Row, Col, Card } from "antd";
import TrackSearchResult from "./TrackSearchResult";
import RecentTrack from "./components/RecentTrack";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import TrackCollection from "./components/TrackCollection";
// import "./index.css";

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
  const [artistIDs, setArtistIDs] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [allArtistsFetched, setAllArtistsFetched] = useState(false);
  const [forgottenPlaylists, setForgottenPlaylists] = useState([]);

  console.log("Forgotten platlists: ", forgottenPlaylists);

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

  useEffect(async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !trackIDs.length) return;
    const artistTracks = await Promise.all(
      artistIDs.map(async (artistID) => {
        const response = await axios.get(
          "http://localhost:3001/tracks/artists",
          {
            params: {
              artistID: artistID,
              accessToken: token,
            },
          }
        );
        return response.data.tracks;
      })
    );

    setAllArtistsFetched(true);
    const reducedTracks = artistTracks.reduce((acc, tracks) => {
      return [...acc, ...tracks];
    }, []);

    setArtistTracks(reducedTracks);

    console.log("Artist Recommended Tracks are: ", reducedTracks);
  }, [artistIDs]);

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

        // setImages((state) => [
        //   ...state,
        //   res?.data?.map((track) => track?.album.images?.[0]?.url),
        // ]);
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
        const artistIDs = res?.data
          ?.slice(res.data.length / 2)
          .map((item) => item?.artists?.[0]?.id);
        const trackIDs = res?.data?.map((item) => item.id) || {};
        setTrackIDs(trackIDs);
        setArtistIDs(artistIDs);
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

  useEffect(() => {
    if (!accessToken || !allArtistsFetched) return;

    setAllArtistsFetched(false);
    // const token = localStorage.getItem("authToken");
    // spotifyApi.setAccessToken(accessToken);
    console.log("Getting Old Playlists");
    const recentType = "tracks";

    axios
      .get(`http://localhost:3001/forgotten-playlists`, {
        params: {
          accessToken: accessToken,
        },
      })
      .then((res) => {
        const sortedPlaylists = res.data.sort((a, b) => a.name - b.name);
        setForgottenPlaylists(sortedPlaylists);
        // console.log("recent tracks", res.data);
        // setRecentTracks(res.data);
        // const artistIDs = res?.data
        //   ?.slice(res.data.length / 2)
        //   .map((item) => item?.artists?.[0]?.id);
        // const trackIDs = res?.data?.map((item) => item.id) || {};
        // setTrackIDs(trackIDs);
        // setArtistIDs(artistIDs);
        // setImages((state) => [
        //   ...state,
        //   res?.data?.map((track) => track?.album.images?.[0]?.url),
        // ]);
      });
  }, [accessToken, allArtistsFetched]);

  // useEffect(() => {
  //   if (!accessToken) return;
  //   const token = localStorage.getItem("authToken");
  //   // spotifyApi.setAccessToken(accessToken);
  //   console.log("calling recents api for artist");
  //   const recentType = "artists";

  //   axios
  //     .get(`http://localhost:3001/recent/${recentType}`, {
  //       params: {
  //         accessToken: accessToken,
  //       },
  //     })
  //     .then((res) => {
  //       console.log("recent tracks", res.data);
  //       debugger;
  //       // setRecentArtists(res.data);
  //       // const trackIDs = res?.data?.map((item) => item.id) || {};
  //       // setTrackIDs(trackIDs);

  //       // setImages((state) => [
  //       //   ...state,
  //       //   res?.data?.map((track) => track?.album.images?.[0]?.url),
  //       // ]);
  //     })
  //     .catch((err) => {
  //       debugger;
  //       console.error(err);
  //     });
  // }, [accessToken]);

  return (
    <Container
      className="d-flex flex-column"
      style={{ height: "100vh", width: "100%", backgroundColor: "#705B61" }}
    >
      {/* <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      /> */}
      <div className="flex-grow-1 my-2" style={{ overflowY: "scroll" }}>
        {/* {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))} */}
        {/* {searchResults.length === 0 && (
          <div className="text-center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )} */}
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <TrackCollection
              title={"Some of your most recent songs"}
              tracksToShow={recentTracks}
              chooseTrack={chooseTrack}
            />
          </Col>
          <Col span={12}>
            <TrackCollection
              title="Some recommendations based on your recent songs"
              tracksToShow={recommendedTracks}
              chooseTrack={chooseTrack}
            />
          </Col>
          <Col span={12}>
            <TrackCollection
              title="Binge on some of your favorite Artists"
              tracksToShow={artistTracks}
              chooseTrack={chooseTrack}
            />
          </Col>
          {forgottenPlaylists.length ? (
            forgottenPlaylists.map((playlist) => {
              return (
                <Col span={12}>
                  <TrackCollection
                    title={playlist.name}
                    tracksToShow={playlist.tracks}
                    chooseTrack={chooseTrack}
                  />
                </Col>
              );
            })
          ) : (
            <></>
          )}
        </Row>
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
