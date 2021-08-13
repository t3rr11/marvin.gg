import Dexie from 'dexie';
import * as BungieRequest from '../requests/BungieReq';

export var MANIFEST;
export const DB = new Dexie('manifest');
DB.version(1).stores({
  ManifestVersion: 'version',
  DestinyActivityDefinition: 'definition',
  DestinyActivityTypeDefinition: 'definition',
  DestinyActivityModeDefinition: 'definition',
  DestinyCollectibleDefinition: 'definition',
  DestinyPresentationNodeDefinition: 'definition',
  DestinyRecordDefinition: 'definition',
  DestinyInventoryItemLiteDefinition: 'definition',
  DestinyObjectiveDefinition: 'definition',
  DestinyProgressionDefinition: 'definition',
  DestinyTalentGridDefinition: 'definition',
  DestinyVendorDefinition: 'definition'
});

function SetNextManifestCheck() { localStorage.setItem('nextManifestCheck', new Date().getTime() + (1000 * 60 * 60)); }

const manifestLoadAttempts = 0;
const maxLoadAttempts = 3;
export async function StoreManifest(callback) {
  try {
    if (manifestLoadAttempts > maxLoadAttempts) {
      throw `Manifest is corrupted after ${maxLoadAttempts} attempts.`;
    }
    manifestLoadAttempts++;
    callback({
      status: "storingManifest",
      statusText: "Storing Manifest...",
      error: false,
      loading: true,
      manifestMounted: false
    });
    let isManifestRefreshRequired = false;

    let values = await Promise.all([
      DB.table("DestinyActivityDefinition").toCollection().first(),
      DB.table("DestinyActivityTypeDefinition").toCollection().first(),
      DB.table("DestinyActivityModeDefinition").toCollection().first(),
      DB.table("DestinyCollectibleDefinition").toCollection().first(),
      DB.table("DestinyPresentationNodeDefinition").toCollection().first(),
      DB.table("DestinyRecordDefinition").toCollection().first(),
      DB.table("DestinyInventoryItemLiteDefinition").toCollection().first(),
      DB.table("DestinyObjectiveDefinition").toCollection().first(),
      DB.table("DestinyProgressionDefinition").toCollection().first(),
      DB.table("DestinyTalentGridDefinition").toCollection().first(),
      DB.table("DestinyVendorDefinition").toCollection().first()
    ]);

    //Add data to global manifest object
    MANIFEST = {
      DestinyActivityDefinition: values[0].data,
      DestinyActivityTypeDefinition: values[1].data,
      DestinyActivityModeDefinition: values[2].data,
      DestinyCollectibleDefinition: values[3].data,
      DestinyPresentationNodeDefinition: values[4].data,
      DestinyRecordDefinition: values[5].data,
      DestinyInventoryItemDefinition: values[6].data,
      DestinyInventoryItemLiteDefinition: values[6].data,
      DestinyObjectiveDefinition: values[7].data,
      DestinyProgressionDefinition: values[8].data,
      DestinyTalentGridDefinition: values[9].data,
      DestinyVendorDefinition: values[10].data
    };

    // Check if the manifest components are empty
    Object.keys(MANIFEST).forEach((key) => {
      if (Object.keys(MANIFEST[key]).length === 0) {
        isManifestRefreshRequired = true;
        console.warn(`Manifest is corrupted ('${key}' is empty)`);
      }
    });

    // If data is enpty, refresh from Bungie
    if (isManifestRefreshRequired) {
      await ClearManifest();
      await Load(callback);
    } else {
      console.log("Manifest Unpacked Successfully");
      callback({
        status: "ready",
        statusText: "",
        loading: false,
        manifestMounted: true
      });
    }
  } catch (err) {
    callback({
      status: "failedManifestMount",
      statusText: "Failed to Mount Manifest, Try Refresh?",
      error: true,
      loading: true,
      manifestMounted: false
    });
    DB.clear();
    console.log("Error occured trying to grab manifest from IndexDB");
  }
}

export async function ClearManifest() {
  DB.table('ManifestVersion').clear();
  DB.table('DestinyActivityDefinition').clear();
  DB.table('DestinyActivityTypeDefinition').clear();
  DB.table('DestinyActivityModeDefinition').clear();
  DB.table('DestinyCollectibleDefinition').clear();
  DB.table('DestinyPresentationNodeDefinition').clear();
  DB.table('DestinyRecordDefinition').clear();
  DB.table('DestinyInventoryItemLiteDefinition').clear();
  DB.table('DestinyObjectiveDefinition').clear();
  DB.table('DestinyProgressionDefinition').clear();
  DB.table('DestinyTalentGridDefinition').clear();
  DB.table('DestinyVendorDefinition').clear();
}
export async function Load(callback) {
  callback({ status: 'loadingManifest', statusText: 'Loading Manifest...', error: false, loading: true, manifestMounted: false });
  if(await Dexie.exists("manifest")) {
    if(localStorage.getItem('nextManifestCheck') && new Date().getTime() < parseInt(localStorage.getItem('nextManifestCheck'))) {
      //Manifest is less than an hour old. Set manifest to global variable: MANIFEST;
      callback({ status: 'unpackingManifest', statusText: 'Unpacking Manifest...', error: false, loading: true, manifestMounted: false });
      await StoreManifest((state) => { callback(state); });
    }
    else {
      //Manifest has expired
      console.log("Expired");
      callback({ status: 'expiredManifest', statusText: 'Checking for manifest updates...', error: false, loading: true, manifestMounted: false });
      //Define variables
      await BungieRequest.GetManifestVersion(async (isError, Data) => {
        if(!isError) {
          let currentVersion = Data.Response.version;
          let storedVersion = await DB.table('ManifestVersion').toCollection().first();
          //Check versions
          if(storedVersion?.version === currentVersion?.version) { await StoreManifest((state) => { callback(state); }); SetNextManifestCheck(); }
          else {
            //Version were different, updating the manifest now.
            console.log("Updating Manifest");
            callback({ status: 'updatingManifest', statusText: 'Updating Manifest...', error: false, error: false, loading: true, manifestMounted: false });
            downloadManifest((state) => { callback(state); });
          }
        }
        else { callback(true, "Failed to get manifest version in order to download new manifest.") } //TODO ERROR HANDLER
      });
    }
  }
  else {
    //No manifest found
    callback({ status: 'noManifest', statusText: 'Downloading Bungie Manifest...', error: false, loading: true, manifestMounted: false });
    downloadManifest((state) => { callback(state); });
  }
}
async function downloadManifest(callback) {
  await BungieRequest.GetManifestVersion(async (isError, Data) => {
    if(!isError) {
      const DestinyActivityDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyActivityDefinition;
      const DestinyActivityTypeDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyActivityTypeDefinition;
      const DestinyActivityModeDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyActivityModeDefinition;
      const DestinyCollectibleDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyCollectibleDefinition;
      const DestinyPresentationNodeDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyPresentationNodeDefinition;
      const DestinyRecordDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyRecordDefinition;
      const DestinyInventoryItemLiteDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyInventoryItemLiteDefinition;
      const DestinyObjectiveDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyObjectiveDefinition;
      const DestinyProgressionDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyProgressionDefinition;
      const DestinyTalentGridDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyTalentGridDefinition;
      const DestinyVendorDefinition = Data.Response.jsonWorldComponentContentPaths['en'].DestinyVendorDefinition;

      Promise.all([
        await BungieRequest.GetManifest(DestinyActivityDefinition),
        await BungieRequest.GetManifest(DestinyActivityTypeDefinition),
        await BungieRequest.GetManifest(DestinyActivityModeDefinition),
        await BungieRequest.GetManifest(DestinyCollectibleDefinition),
        await BungieRequest.GetManifest(DestinyPresentationNodeDefinition),
        await BungieRequest.GetManifest(DestinyRecordDefinition),
        await BungieRequest.GetManifest(DestinyInventoryItemLiteDefinition),
        await BungieRequest.GetManifest(DestinyObjectiveDefinition),
        await BungieRequest.GetManifest(DestinyProgressionDefinition),
        await BungieRequest.GetManifest(DestinyTalentGridDefinition),
        await BungieRequest.GetManifest(DestinyVendorDefinition)
      ]).then(async (values) => {
        callback({ status: 'storingManifest', statusText: "Storing Manfiest...", error: false, loading: true, manifestMounted: false });
        try { ClearManifest(); } catch (err) { console.log(err); console.log("No manifest to clear. Ignore this."); }

        //Add data to databases
        DB.table('ManifestVersion').add({ version: Data.Response.version }).then(() => { console.log("Successfully Added ManifestVersion"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyActivityDefinition').add({ definition: 'DestinyActivityDefinition', data: values[0].Data }).then(() => { console.log("Successfully Added DestinyActivityDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyActivityTypeDefinition').add({ definition: 'DestinyActivityTypeDefinition', data: values[1].Data }).then(() => { console.log("Successfully Added DestinyActivityTypeDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyActivityModeDefinition').add({ definition: 'DestinyActivityModeDefinition', data: values[2].Data }).then(() => { console.log("Successfully Added DestinyActivityModeDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyCollectibleDefinition').add({ definition: 'DestinyCollectibleDefinition', data: values[3].Data }).then(() => { console.log("Successfully Added DestinyCollectibleDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyPresentationNodeDefinition').add({ definition: 'DestinyPresentationNodeDefinition', data: values[4].Data }).then(() => { console.log("Successfully Added DestinyPresentationNodeDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyRecordDefinition').add({ definition: 'DestinyRecordDefinition', data: values[5].Data }).then(() => { console.log("Successfully Added DestinyRecordDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyInventoryItemLiteDefinition').add({ definition: 'DestinyInventoryItemLiteDefinition', data: values[6].Data }).then(() => { console.log("Successfully Added DestinyInventoryItemLiteDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyObjectiveDefinition').add({ definition: 'DestinyObjectiveDefinition', data: values[7].Data }).then(() => { console.log("Successfully Added DestinyObjectiveDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyProgressionDefinition').add({ definition: 'DestinyProgressionDefinition', data: values[8].Data }).then(() => { console.log("Successfully Added DestinyProgressionDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyTalentGridDefinition').add({ definition: 'DestinyTalentGridDefinition', data: values[9].Data }).then(() => { console.log("Successfully Added DestinyTalentGridDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });
        DB.table('DestinyVendorDefinition').add({ definition: 'DestinyVendorDefinition', data: values[10].Data }).then(() => { console.log("Successfully Added DestinyVendorDefinition"); }).catch(error => { this.handleError(error); return "Failed"; });

        //Set manifest
        await StoreManifest((state) => { callback(state); });
        SetNextManifestCheck();

      }).catch((error) => {
        console.log(error);
        callback({
          status: 'failedManifestDownload',
          statusText: "Failed to Download Manifest, Try Refresh?",
          error: true,
          loading: true,
          manifestMounted: false
        });
      });
    }
    else { callback(true, "Failed to get manifest version in order to download new manifest.") } //TODO ERROR HANDLER
  });
}