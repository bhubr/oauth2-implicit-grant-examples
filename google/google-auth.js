import { clientId, redirectUri } from './config.js';

/*
 * Create form to request access token from Google's OAuth 2.0 server.
 */
function oauthSignIn() {
  // Google's OAuth 2.0 endpoint for requesting an access token
  var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  var form = document.createElement('form');
  form.setAttribute('method', 'GET'); // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint);

  // Parameters to pass to OAuth 2.0 endpoint.
  var params = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    include_granted_scopes: 'true',
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

const mapItem = ({ id, snippet: { title, thumbnails } }) => ({
  id,
  title,
  thumbnail: thumbnails.default.url
});

const accessToken = getAccessTokenFromLocationHash();
if (!accessToken) {
  oauthSignIn();
} else {
  fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&videoCategoryId=10', {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })
  .then((res) => {
    console.log(res.ok ? 'OK' : 'NOK');
    return res.json();
  })
  .then(data => console.log(data.items)|| data.items.map(mapItem))
  .then(videos => {
    for (let v of videos) {
      const el = document.createElement('div');
      el.innerHTML = `<img src="${v.thumbnail}" alt="${v.title}" /><a href="https://youtube.com/watch?v=${v.id}">${v.title}</a>`;
      document.body.appendChild(el);
    }
  })
}