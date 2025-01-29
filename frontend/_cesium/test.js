
import data from './companyinfo.json';

function getBuildingInfo(data, bldgNumber) {
  if (data[bldgNumber]) {
    return data[bldgNumber];
  }
  return null;
}

let titleText = "13104-bldg-8099"

// Get the building info
const buildingInfo = getBuildingInfo(data, titleText);
if (buildingInfo) {
  console.log(buildingInfo);
  // Output the building info
  console.log("Coordinates:", buildingInfo.coordinates);
  console.log("Connections:", buildingInfo.connections);
} else {
  console.log('Building not found');
}