/*eslint-disable eqeqeq*/
import * as Misc from './Misc';
import * as dAuth from './requests/DiscordAuth';

var DiscordAuthTimer = null;

export async function StopTimer(timer) {
  if(timer == 'DiscordAuth') { try { clearInterval(DiscordAuthTimer); DiscordAuthTimer = null; console.log('Discord Auth Timer Stopped'); } catch (err) { } }
}

export async function startDiscordAuthTimer() {
  if(!Misc.getURLVars()["code"]) {
    if(localStorage.getItem("nextDiscordAuthCheck")) {
      var tokenExpiresIn;
      tokenExpiresIn = parseInt(localStorage.getItem("nextDiscordAuthCheck")) - new Date().getTime();
      tokenExpiresIn = Math.round(tokenExpiresIn / 1000);
      console.log("Discord Access Token expires in: " + Misc.formatTime(tokenExpiresIn));
      try { if(DiscordAuthTimer != null) { StopTimer('DiscordAuth'); } } catch (err) {  }
      console.log('Discord Auth Timer Starting.');
      DiscordAuthTimer = setInterval(function() {
        if(tokenExpiresIn <= 0){
          StopTimer('DiscordAuth');
          dAuth.renewToken();
        }
        else {
          tokenExpiresIn--;
        }
      }, 1000);
    }
    else {
      StopTimer('DiscordAuth');
      dAuth.renewToken();
    }
  }
}