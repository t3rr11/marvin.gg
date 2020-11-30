async function apiRequest(path, data) {
  //Headers for requests
  let encodedData; if(data) { encodedData = Object.keys(data).map(function(k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }).join('&'); }
  const headers = { headers: { "Content-Type": "application/json" } };
  const request = await fetch(`https://api.marvin.gg${path}?${ encodedData ? encodedData : "" }`, headers);
  const response = await request.json();
  if(request.ok && response.ErrorCode && response.ErrorCode !== 1) {
    //Error with api, might have sent bad headers.
    console.log(`Error: ${ JSON.stringify(response) }`);
  }
  else if(request.ok) {
    //Everything is ok, request was returned to sender.
    return response;
  }
  else {
    //Error in request ahhhhh!
    console.log(`Error: ${ JSON.stringify(response) }`);
  }
}

export const Test = async () => apiRequest(`/Test`);
export const GetBackendStatus = async () => apiRequest(`/GetBackendStatus`);
export const GetFrontendStatus = async () => apiRequest(`/GetFrontendStatus`);
export const GetBackendStatusHistory = async () => apiRequest(`/GetBackendStatusHistory`);
export const GetFrontendStatusHistory = async () => apiRequest(`/GetFrontendStatusHistory`);
export const GetLogHistory = async () => apiRequest(`/GetLogHistory`);
export const GetDailyAPIStatus = async () => apiRequest(`/GetDailyAPIStatus`);
export const GetFrontendStartup = async () => apiRequest(`/GetFrontendStartup`);
export const GetBackendStartup = async () => apiRequest(`/GetBackendStartup`);
export const GetExpressStartup = async () => apiRequest(`/GetExpressStartup`);
export const GetGlobalsStartup = async () => apiRequest(`/GetGlobalsStartup`);
export const GetLogs = async (data) => apiRequest(`/GetLogs`, data);
export const GetFrontendLogs = async (data) => apiRequest(`/GetFrontendLogs`, data);
export const GetBackendLogs = async (data) => apiRequest(`/GetBackendLogs`, data);
export const GetExpressLogs = async (data) => apiRequest(`/GetExpressLogs`, data);
export const GetDatabaseLogs = async (data) => apiRequest(`/GetDatabaseLogs`, data);
export const GetGlobalsLogs = async (data) => apiRequest(`/GetGlobalsLogs`, data);
export const GetBroadcastLogs = async (data) => apiRequest(`/GetBroadcastLogs`, data);
export const GetErrorHandlerLogs = async (data) => apiRequest(`/GetErrorHandlerLogs`, data);
export const CheckAuthorization = async (data) => apiRequest(`/CheckAuthorization`, data);
