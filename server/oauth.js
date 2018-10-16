const express = require('express');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const request = require('request');

const { clientId, clientSecret, callbackUrl, stateKey, scope } = require('./config');

const router = express.Router();

router.use(cookieParser());


router.get('/', (req, res) => {
  const state = '12345';
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope,
      redirect_uri: callbackUrl,
      state,
    })
  }`);
});

router.get('/callback', (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const { access_token, refresh_token } = body;

        const options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { Authorization: `Bearer ${access_token}` },
          json: true,
        };

        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect(`/#${
          querystring.stringify({
            access_token,
            refresh_token,
          })}`);
      } else {
        res.json({ error: body.error });
        // res.redirect(`/#${
        //   querystring.stringify({
        //     error: 'invalid_token',
        //   })}`);
      }
    });
  }
});

module.exports = router;
