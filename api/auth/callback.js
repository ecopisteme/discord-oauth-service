import fetch from 'node-fetch';

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI
    })
  });
  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) return res.status(500).send('Token failed');

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const userJson = await userRes.json();
  if (!userJson.id) return res.status(500).send('User fetch failed');

  await fetch('https://ecopisteme.com/api/bind-discord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LOVABLE_API_KEY}`
    },
    body: JSON.stringify({
      user_id:    req.query.state,  // state里带上Loveable会员ID
      discord_id: userJson.id
    })
  });

  res.redirect('https://ecopisteme.com/profile?discord=success');
}
