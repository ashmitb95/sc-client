import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./components/Player";
import { Row, Col, Card, Tabs, Carousel } from "antd";
import TrackSearchResult from "./components/TrackSearchResult";
import RecentTrack from "./components/RecentTrack";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import TrackCollection from "./components/TrackCollection";
import BaseLayout from "./components/Layout";
import StickyBox from "react-sticky-box";
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";
import Scroller from "./components/scrolltest";

import HorizontalScroll from "react-horizontal-scrolling";

import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
// import "./index.css";

import React from "react";
import { Breadcrumb, Layout, Menu, theme } from "antd";
const { Header, Content, Footer } = Layout;

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
  const [artistInfo, setArtistInfo] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [allArtistsFetched, setAllArtistsFetched] = useState(false);
  const [forgottenPlaylists, setForgottenPlaylists] = useState([]);
  const [activeKey, setActiveKey] = useState("1");

  const onChange = (key) => {
    console.log(key);
  };
  const {
    token: { colorBgContainer },
  } = theme.useToken();

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
    const tracksByArtists = await Promise.all(
      artistInfo.map(async (currentArtist) => {
        const response = await axios.get(
          "http://localhost:3001/tracks/artists",
          {
            params: {
              artistID: currentArtist.id,
              accessToken: token,
            },
          }
        );
        return { artist: currentArtist, tracks: response.data.tracks };
      })
    );

    setAllArtistsFetched(true);
    // const reducedTracks = artistTracks.reduce((acc, tracks) => {
    //   return [...acc, ...tracks];
    // }, []);

    setArtistTracks(tracksByArtists);

    // console.log("Artist Recommended Tracks are: ", reducedTracks);
  }, [artistInfo]);

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
        setRecommendedTracks(res.data.tracks);
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
        const artistInfo = res?.data
          ?.slice(res.data.length / 2)
          .map((item) => item?.artists?.[0]);
        const trackIDs = res?.data?.map((item) => item.id) || {};
        setTrackIDs(trackIDs);
        setArtistInfo(artistInfo);
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
      });
  }, [accessToken, allArtistsFetched]);

  const items = [
    {
      key: "1",
      label: `Recommendations`,
      children: (
        <>
          <Row gutter={[40, 0]} justify={"center"}>
            <Col span={8} style={{ margin: "auto 80px" }}>
              <TrackCollection
                title={"Some of your most recent songs"}
                tracksToShow={recentTracks}
                chooseTrack={chooseTrack}
              />
            </Col>
            <Col span={8} style={{ margin: "auto 80px" }}>
              <TrackCollection
                title="Some recommendations based on your recent songs"
                tracksToShow={recommendedTracks}
                chooseTrack={chooseTrack}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "2",
      label: `Artists`,
      forceRender: true,
      children: (
        <>
          <div className="scrolling-wrapper">
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
            })}
          </div>
        </>
      ),
    },
    {
      key: "3",
      label: `Tunes from the past`,
      forceRender: true,
      children: (
        <>
          <div className="scrolling-wrapper">
            {forgottenPlaylists.map((playlist) => {
              return (
                <div className="card">
                  <TrackCollection
                    title={playlist.name}
                    tracksToShow={playlist.tracks}
                    chooseTrack={chooseTrack}
                  />
                </div>
              );
            })}
          </div>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={new Array(3).fill(null).map((_, index) => ({
            key: String(index + 1),
            label: `nav ${index + 1}`,
          }))}
        />
      </Header>
      <Content
        className="site-layout"
        style={{
          padding: "0 50px",
        }}
      >
        {/* <Breadcrumb
          style={{
            margin: "16px 0",
          }}
        >
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb> */}
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
          }}
        >
          {/* <Container
            className="d-flex flex-column"
            style={{
              height: "100vh",
              width: "100%",
              backgroundColor: "#1D2123",
            }}
          > */}
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
            
          />)}*/}

            <Row>
              <LeftOutlined
                style={{ fontSize: 40 }}
                onClick={() => {
                  console.log("Button clicked");
                  setActiveKey((state) => {
                    const currentKey = parseInt(state);
                    if (currentKey > 1) return (currentKey - 1).toString();
                  });
                }}
              />
              <RightOutlined
                style={{ fontSize: 40 }}
                onClick={() => {
                  debugger;
                  console.log("Button clicked");
                  setActiveKey((state) => {
                    debugger;
                    const currentKey = parseInt(state);
                    if (currentKey < 3) return (currentKey + 1).toString();
                  });
                }}
              />
            </Row>
            <Tabs
              className="music-tabs"
              defaultActiveKey="1"
              activeKey={activeKey}
              items={items}
              // onChange={onChange}
            />

            {/* </Row> */}
          </div>
          {/* <div>
            <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
          </div> */}
          {/* </Container> */}
        </div>
      </Content>
      <Footer
        style={{
          textAlign: "center",
        }}
      >
        Ant Design ©2023 Created by Ant UED
      </Footer>
    </Layout>
  );
}
/**
 *           <Carousel afterChange={onChange}>
            {groupedArtists?.map((artistGroup) => (
              <Row gutter={[16, 16]}>
                {artistGroup.map((artist) => (
                  <Col span={12} style={{ display: "flex" }}>
                    <TrackCollection
                      title={artist.artist.name}
                      tracksToShow={artist.tracks}
                      chooseTrack={chooseTrack}
                    />
                  </Col>
                ))}
              </Row>
            ))}
            {/* {artistTracks.map((artist) => {
              return (
                <Col span={8}>
                <div className="item">
                  <TrackCollection
                    title={artist.artist.name}
                    tracksToShow={artist.tracks}
                    chooseTrack={chooseTrack}
                  />
                </div>
              );
            })} }
            </Carousel>
 */
