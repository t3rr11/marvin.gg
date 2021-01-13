import * as Timers from '../Timers';
import * as API from './API';

var client_id = "631351366799065088";
var client_secret = "jv_o_MT_Q8OjIZErSnO3qdqtYAf_16rH";
var scope = "identify guilds";
var redirect_uri = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://marvin.gg';
var discord_login_url = "https://discord.com/api/oauth2/authorize";
var discord_token_url = "https://discord.com/api/oauth2/token";
var discord_api_url = "https://discord.com/api";
var discord_webhooks_url = "https://discord.com/api/webhooks";

const encodedAuth = `Basic ${ Buffer.from(`${ client_id }:${ client_secret }`, "base64") }`;

export function linkWithDiscord() { window.location.href = `${ discord_login_url }?client_id=${ client_id }&redirect_uri=${ redirect_uri }&response_type=code&scope=${ encodeURI(scope) }`; }

export async function getAccessToken(code) {
  fetch(discord_token_url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}&scope=${ encodeURI(scope) }`
  })
  .then(async (response) => {
    response = JSON.parse(await response.text());
    if(response.error) { console.log(response); window.location.href = `?failed=true&reason=${response.message}`; }
    else {
      saveAuth(response, async (isError) => {
        if(!isError) {
          localStorage.setItem('DiscordAuth', JSON.stringify(response));
          localStorage.setItem("nextDiscordAuthCheck", new Date().getTime() + (response.expires_in * 1000));
          await getDiscordUserInfo((isError, data) => {
            if(!isError) {
              localStorage.setItem('DiscordInfo', JSON.stringify(data));
              window.location.href = '/';
            }
            else {
              console.log(data);
              window.location.href = '?failed=true';
            }
          });
        }
        else { console.log(response); window.location.href = `?failed=true&reason=${encodeURI("Failed to save authentication with database, Can not verify user.")}`; }
      });
    }
  })
  .catch((error) => { console.error(error); window.location.href = `?failed=true&reason=unknown` });
}
export async function renewToken() {
  const authData = JSON.parse(localStorage.getItem('DiscordAuth'));
  fetch(discord_token_url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token&refresh_token=${authData.refresh_token}&redirect_uri=${redirect_uri}&scope=${ encodeURI(scope) }`
  })
  .then(async (response) => {
    response = JSON.parse(await response.text());
    if(response.error) {
      if(response.error === "invalid_grant") { console.log(response); linkWithDiscord(); }
      else { console.log(response); window.location.href = `?failed=true&reason=${response}`; }
    }
    else {
      saveAuth(response, async (isError) => {
        if(!isError) {
          localStorage.setItem('DiscordAuth', JSON.stringify(response));
          localStorage.setItem("nextDiscordAuthCheck", new Date().getTime() + (response.expires_in * 1000));
          console.log(`Discord Authorization has been renewed!`);
          Timers.startDiscordAuthTimer();
        }
        else { window.location.href = `?failed=true&reason=${encodeURI("Failed to update authentication with database, Can not verify user.")}` }
      });
    }
  })
  .catch((error) => { console.error(error); window.location.href = `?failed=true&reason=unknown` });
}
export async function checkAuth(callback) {
  // Callback(isError, isLoggedIn, Data)
  if(localStorage.getItem('DiscordAuth')) {
    await getDiscordUserInfo((isError, data) => {
      if(!isError) {
        localStorage.setItem('DiscordInfo', JSON.stringify(data));
        callback(false, true, "Success");
      }
      else {
        console.log(data);
        callback(true, true, "Invalid Token");
      }
    });
  }
  else { callback(false, false, "Not Logged In"); }
}
async function saveAuth(auth, callback) { API.SaveAuth(auth, (data) => { callback(data.isError) }); }

export async function getDiscordUserInfo(callback) {
  //Callback(isError, Data)
  var discordAuth = JSON.parse(localStorage.getItem('DiscordAuth'));
  fetch(discord_api_url + "/users/@me", {
    method: 'GET',
    headers: new Headers({ 'Authorization': `Bearer ${ discordAuth.access_token }`, 'Content-Type': 'application/x-www-form-urlencoded' })
  })
  .then(async (response) => {
    response = JSON.parse(await response.text());
    if(response.error) { callback(true, response); }
    else { callback(false, response); }
  })
  .catch((error) => { callback(true, error); });
}
export async function getDiscordGuildInfo(callback) {
  //Callback(isError, Data)
  var discordAuth = JSON.parse(localStorage.getItem('DiscordAuth'));
  fetch(discord_api_url + `/users/@me/guilds`, {
    method: 'GET',
    headers: new Headers({ 'Authorization': `Bearer ${ discordAuth.access_token }`, 'Content-Type': 'application/x-www-form-urlencoded' })
  })
  .then(async function(response) {
    response = JSON.parse(await response.text());
    if(response.error) { callback(true, response); }
    else { callback(false, response); }
  })
  .catch((error) => { console.log(error); return { error: true, reason: error } });
}