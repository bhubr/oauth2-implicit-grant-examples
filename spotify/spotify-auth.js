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

const mapItem = ({ id, href, name, images }) => ({
  id,
  title: name,
  thumbnail: images[2].url,
  href
});

const accessToken = getAccessTokenFromLocationHash();
if (!accessToken) {
  oauthSignIn();
} else {
  fetch('https://api.spotify.com/v1/browse/new-releases', {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  .then((res) => {
    console.log(res.ok ? 'OK' : 'NOK');
    return res.json();
  })
  .then(({ albums }) => albums.items.map(mapItem))
  .then(albums => {
    for (let a of albums) {
      const el = document.createElement('div');
      el.innerHTML = `<img src="${a.thumbnail}" alt="${a.title}" /><a href="${a.href}">${a.title}</a>`;
      document.body.appendChild(el);
    }
  })
}