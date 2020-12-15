/*eslint-disable eqeqeq*/
export function formatTime(TimeinSeconds) {
  var years, months, weeks, days, hours, minutes, seconds;

  seconds = Math.floor(Number(TimeinSeconds));
  years    = Math.floor(seconds / (24*60*60*7*4.34*12));
  seconds -= Math.floor(years   * (24*60*60*7*4.34*12));
  months   = Math.floor(seconds / (24*60*60*7*4.34));
  seconds -= Math.floor(months  * (24*60*60*7*4.34));
  weeks    = Math.floor(seconds / (24*60*60*7));
  seconds -= Math.floor(weeks   * (24*60*60*7));
  days     = Math.floor(seconds / (24*60*60));
  seconds -= Math.floor(days    * (24*60*60));
  hours    = Math.floor(seconds / (60*60));
  seconds -= Math.floor(hours   * (60*60));
  minutes  = Math.floor(seconds / (60));
  seconds -= Math.floor(minutes * (60));

  var YDisplay, MDisplay, wDisplay, dDisplay, hDisplay, mDisplay, sDisplay;

  YDisplay = years > 0 ? years + (years == 1 ? ' year ' : ' years ') : '';
  MDisplay = months > 0 ? months + (months == 1 ? ' month ' : ' months ') : '';
  wDisplay = weeks > 0 ? weeks + (weeks == 1 ? ' week ' : ' weeks ') : '';
  dDisplay = days > 0 ? days + (days == 1 ? ' day ' : ' days ') : '';
  hDisplay = hours > 0 ? hours + (hours == 1 ? ' hour ' : ' hours ') : '';
  mDisplay = minutes > 0 ? minutes + (minutes == 1 ? ' minute ' : ' minutes ') : '';
  sDisplay = seconds > 0 ? seconds + (seconds == 1 ? ' second ' : ' seconds ') : '';

  if (TimeinSeconds < 60) { return sDisplay; }
  if (TimeinSeconds >= 60 && TimeinSeconds < 3600) { return mDisplay; }
  if (TimeinSeconds >= 3600 && TimeinSeconds < 86400) { return hDisplay + mDisplay; }
  if (TimeinSeconds >= 86400 && TimeinSeconds < 604800) { return dDisplay + hDisplay; }
  if (TimeinSeconds >= 604800 && TimeinSeconds < 2624832) { return wDisplay + dDisplay; }
  if (TimeinSeconds >= 2624832 && TimeinSeconds < 31497984) { return MDisplay + wDisplay; }
  if (TimeinSeconds >= 31497984 && TimeinSeconds !== Infinity) { return YDisplay + MDisplay; }
  return YDisplay + MDisplay + wDisplay + dDisplay + hDisplay + mDisplay + sDisplay;
}
export function formatSmallTime(TimeinSeconds) {
  var days, hours, minutes, seconds;

  seconds = Math.floor(Number(TimeinSeconds));
  days     = Math.floor(seconds / (24*60*60));
  seconds -= Math.floor(days    * (24*60*60));
  hours    = Math.floor(seconds / (60*60));
  seconds -= Math.floor(hours   * (60*60));
  minutes  = Math.floor(seconds / (60));
  seconds -= Math.floor(minutes * (60));

  var dDisplay, hDisplay, mDisplay, sDisplay;

  dDisplay = days > 0 ? days + (days == 1 ? 'd ' : 'd ') : '';
  hDisplay = hours > 0 ? hours + (hours == 1 ? 'h ' : 'h ') : '';
  mDisplay = minutes > 0 ? minutes + (minutes == 1 ? 'm ' : 'm ') : '';
  sDisplay = seconds > 0 ? seconds + (seconds == 1 ? 's ' : 's ') : '';

  if (TimeinSeconds < 60) { return sDisplay; }
  if (TimeinSeconds >= 60 && TimeinSeconds < 3600) { return mDisplay + sDisplay; }
  if (TimeinSeconds >= 3600 && TimeinSeconds < 86400) { return hDisplay + mDisplay; }
  if (TimeinSeconds >= 86400 && TimeinSeconds !== Infinity) { return dDisplay + hDisplay; }
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
export function formatCountDownTime(TimeinSeconds) {
  var days, hours, minutes, seconds;

  seconds = Math.floor(Number(TimeinSeconds));
  days     = Math.floor(seconds / (24*60*60));
  seconds -= Math.floor(days    * (24*60*60));
  hours    = Math.floor(seconds / (60*60));
  seconds -= Math.floor(hours   * (60*60));
  minutes  = Math.floor(seconds / (60));
  seconds -= Math.floor(minutes * (60));

  var dDisplay, hDisplay, mDisplay, sDisplay;

  dDisplay = days > 0 ? days + (days == 1 ? 'd ' : 'd ') : '';
  hDisplay = hours > 0 ? hours + (hours == 1 ? 'h ' : 'h ') : '';
  mDisplay = minutes > 0 ? minutes + (minutes == 1 ? 'm ' : 'm ') : '';
  sDisplay = seconds > 0 ? seconds + (seconds == 1 ? 's ' : 's ') : '';

  if (TimeinSeconds < 60) { return sDisplay; }
  if (TimeinSeconds >= 60 && TimeinSeconds < 3600) { return mDisplay + sDisplay; }
  if (TimeinSeconds >= 3600 && TimeinSeconds < 86400) { return hDisplay + mDisplay + sDisplay; }
  if (TimeinSeconds >= 86400 && TimeinSeconds !== Infinity) { return dDisplay + hDisplay + mDisplay + sDisplay; }
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
export function convertTimeToDate(time) {
  var date = new Date(time);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  if(day < 10) { day = "0" + day; }
  var result = day + '/' + month + '/' + year;
  return result;
}
export function AddCommas(x) { try { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") } catch (err) { return x } }
export function isJSON(data) { try { JSON.parse(data); return true; } catch (e) { return false; } }
export function getURLVars() {
  var vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
  function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}
export function noManifest() {
  const urls = ["register, joinmarvin"];
  if(urls.find(e => e.toLowerCase() === window.location.href.split("/")[3])) { return true; }
}
export function getPlatformName(type) {
  if(type === 1){ return "XBL" }
  else if(type === 2){ return "PSN" }
  else if(type === 3){ return "STEAM" }
  else if(type === 4){ return "BNET" }
  else if(type === 5){ return "STADIA" }
}
export function getPlatformType(name) {
  if(name === "XBL"){ return 1 }
  else if(name === "PSN"){ return 2 }
  else if(name === "STEAM"){ return 3 }
  else if(name === "BNET"){ return 4 }
  else if(name === "STADIA"){ return 5 }
}
export function getClassName(classType) {
  if(classType === 0) { return "Titan" }
  else if(classType === 1) { return "Hunter" }
  else if(classType === 2) { return "Warlock" }
}
export function htmlDecode(input) {
  var e = document.createElement('textarea');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}