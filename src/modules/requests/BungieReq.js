import * as Misc from '../Misc';

async function Request(path, isStat, isAuthRequired) {
  //Headers for requests
  var headers, authHeaders = null;
  try { headers = { headers: { "X-API-Key": "f4be3b9dd8374307b89fd109222e8998", "Content-Type": "application/json" } } } catch (err) { headers = {  }; }
  try { authHeaders = { headers: { "X-API-Key": "f4be3b9dd8374307b89fd109222e8998", "Content-Type": "application/json", "Authorization": `Bearer ${ JSON.parse(localStorage.getItem('Authorization')).access_token }` } } } catch (err) { authHeaders = { }; }
  return await fetch(`https://${isStat ? 'stats' : 'www'}.bungie.net${path}`, isAuthRequired ? authHeaders : headers).then(async (request) => {
    try {
      const response = await request.text();
      if(Misc.isJSON(response)) {
        const res = JSON.parse(response);
        if(request.ok && res?.ErrorCode !== 1) { return { "isError": true, "Data": res } }
        else if(request.ok) { return { "isError": false, "Data": res } }
        else { return { "isError": true, "Data": res } }
      }
      else { return { "isError": true, "Data": "Did not recieve json" } }
    }
    catch (err) { return { "isError": true, "Data": err } }
  });
}
async function BungieReq(path, requiresKey) {
  let headers;
  if(requiresKey) { headers = { "X-API-Key": "f4be3b9dd8374307b89fd109222e8998", "Content-Type": "application/json" } }
  else { headers = { "Content-Type": "application/json" } }
  return await fetch(`https://www.bungie.net${ path }`).then(async (request) => {
    try {
      const response = await request.text();
      if(Misc.isJSON(response)) {
        const res = JSON.parse(response);
        if(request.ok && res?.ErrorCode !== 1) { return { "isError": true, "Data": res } }
        else if(request.ok) { return { "isError": false, "Data": res } }
        else { return { "isError": true, "Data": res } }
      }
      else { return { "isError": true, "Data": "Did not recieve json" } }
    }
    catch (err) { return { "isError": true, "Data": err } }
  }).catch((err) => { return { "isError": true, "Data": err } });
}

export const GetManifestVersion = async (callback) => { const { isError, Data } = await BungieReq(`/Platform/Destiny2/Manifest/`); callback(isError, Data); }

export const GetProfile = async (membershipType, membershipId, components, auth = false) => Request(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`, false, auth);
export const GetActivityHistory = async (membershipType, membershipId, characterId, count, mode, page = 0) => Request(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?count=${count}&mode=${mode}&page=${page}`, false, false);
export const GetHistoricStatsForAccount = async (membershipType, membershipId) => Request(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Stats/?groups=101`, false, false);
export const GetPGCR = async (instanceId) => Request(`/Platform/Destiny2/Stats/PostGameCarnageReport/${instanceId}/`, true, false);
export const GetManifest = async url => BungieReq(url, false);
export const SearchUsers = async username => Request(`/Platform/User/SearchUsers/?q=${username}`, false, false);
export const SearchDestinyPlayer = async username => Request(`/Platform/Destiny2/SearchDestinyPlayer/-1/${username}/`, false, false);
export const GetMembershipId = async platformName => Request(`/Platform/Destiny2/SearchDestinyPlayer/-1/${platformName}/`, false, false);
export const GetMembershipsForCurrentUser = async () => Request(`/Platform/User/GetMembershipsForCurrentUser/`, false, true);
export const GetMembershipsById = async (membershipId) => Request(`/Platform/User/GetMembershipsById/${membershipId}/1/`, false, false);
export const GetInstancedItem = async (membershipId, membershipType, instancedItemId, components) => Request(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Item/${instancedItemId}/?components=${components}`, false, false);
export const GetSpecificModeStats = async (membershipId, membershipType, characterId, modes) => Request(`/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/?groups=101&modes=${modes}&periodType=2`, false, false)
export const GetVendors = async (membershipType, membershipId, characterId) => Request(`/Platform/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/Vendors/?components=400,402`, false, true);
export const GetTWABs = async () => Request(`/Platform/Trending/Categories/`, false, false);
export const GetClan = async (membershipType, membershipId) => Request(`/Platform/GroupV2/User/${ membershipType }/${ membershipId }/0/1/`, false, false);
export const GetClanById = async (clan_id) => Request(`/Platform/GroupV2/${ clan_id }/`, false, false);
export const GetClanMembersById = async (clan_id) => Request(`/Platform/GroupV2/${ clan_id }/Members/`, false, false);