import { clientId, redirectUri } from './config.js';

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn() {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.spotify.com/authorize';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'user-read-private user-read-email',
    state: 'pass-through value',
  };

  // Add form parameters as hidden input values.
  for (var p in params) {
    var input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', p);
    input.setAttribute('value', params[p]);
    form.appendChild(input);
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form);
  form.submit();
}

function getAccessTokenFromLocationHash() {
  const { hash } = window.location;
  if (!hash) return null;
  const tokenRegExp = /access_token=([^&]+)/;
  const matches = hash.match(tokenRegExp);
  return matches && matches[1];
}


const strategies = {
  albums: {
    mapItem: function({ id, href, name, images }) {
      return ({
        id,
        title: name,
        thumbnail: images && images[2].url,
        href
      });
    },
    mapItems: function({ albums }) {
      return albums.items.map(this.mapItem);
    }
  },
  tracks: {
    mapItem: function({ track: { id, href, name, album: { images } } }) {
      return ({
        id,
        title: name,
        thumbnail: images[2].url,
        href
      });
    },
    mapItems: function({ tracks }) {
      return tracks.items.map(this.mapItem);
    }
  }
}

const accessToken = getAccessTokenFromLocationHash();
if (!accessToken) {
  oauthSignIn();
} else {
  // const url = 'https://api.spotify.com/v1/browse/new-releases';
  // const strategy = 'albums';
  const url = 'https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF';
  const strategy = 'tracks';

  fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  .then((res) => {
    console.log(res.ok ? 'OK' : 'NOK');
    return res.json();
  })
  .then(data => strategies[strategy].mapItems(data))
  .then(albums => {
    for (let a of albums) {
      const el = document.createElement('div');
      el.innerHTML = `<img src="${a.thumbnail}" alt="${a.title}" /><a href="${a.href}">${a.title}</a>`;
      document.body.appendChild(el);
    }
  })
}