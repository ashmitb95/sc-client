const PERMISSION_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-recently-played",
  "playlist-read-private",
  //   "user-read-playback-state",
  //   "user-modify-playback-state",
  //   "user-read-currently-playing
];

export const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=128a94262ba742d2aba73d3a6c264a48&response_type=code&redirect_uri=http://localhost:3000&scope=${PERMISSION_SCOPES?.join(
  "%20"
)}`;
