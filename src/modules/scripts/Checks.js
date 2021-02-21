import { MANIFEST } from '../handlers/ManifestHandler';

export async function startUpPageChecks() {
  if(! await checkPlatform()){ return "You have not yet selected your platform." }
  if(! await checkCharacter()){ return "Failed to load characters." }
  return "Checks OK";
}

export async function checkPlatform() { if(localStorage.getItem('SelectedAccount') !== 'Please Select Platform') { return true; } else { return false; } }
export async function checkCharacter() { if(localStorage.getItem('SelectedCharacter') === null) { return false; } else { return true; } }
export async function checkLogin() { if(localStorage.getItem('Authorization') === null) { return false; } else { return true; } }
export async function checkSettingsExist() { if(localStorage.getItem('Settings') === null) { return false; } else { return true; } }
export function checkManifestMounted() {
  if(MANIFEST !== null && MANIFEST !== undefined) { return true; }
  else { return false; }
}