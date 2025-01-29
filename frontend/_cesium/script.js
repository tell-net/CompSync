// Get your token from https://cesium.com/ion/tokens
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNWUwOWY5YS0yYTM5LTQ1MGEtYWE4ZC1hODM5Zjk4ZTE3ZmQiLCJpZCI6MjE3MjQwLCJpYXQiOjE3MTY0NDY0Mjd9.UoaD_QWEt2-r_1cHk1Q_jConuRVkacdd9yHWt4Ob_og';

const viewer = new Cesium.Viewer('cesiumContainer', {
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://gic-plateau.s3.ap-northeast-1.amazonaws.com/2020/ortho/tiles/{z}/{x}/{y}.png',
  })
});

var your_3d_tiles = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
  url: '13104_shinjuku-ku_notexture/tileset.json'
}));

// Zoom the camera to the 3D tiles
viewer.flyTo(your_3d_tiles);

// Load and display KML file
//var kmlDataSource = new Cesium.KmlDataSource();
//kmlDataSource.load('building_info.kml').then(function() {
//  viewer.dataSources.add(kmlDataSource);
//});

// Zoom the camera to the 3D tiles
viewer.flyTo(your_3d_tiles);

// Assuming 'viewer' is your Cesium Viewer instance
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
var currentKmlDataSource = null;  // Variable to store the current KML data source

// Function to create KML string
function createKml(buildingInfo) {
  const coordinates = buildingInfo.coordinates;
  const connections = buildingInfo.connections;

  let kml = `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <!-- Default Style for all lines -->
    <Style id="defaultLineStyle">
      <LineStyle>
        <color>ff0000ff</color> <!-- Blue color -->
        <width>5</width> <!-- Line width -->
      </LineStyle>
    </Style>
    
    <!-- Default properties for LineString -->
    <tessellate>1</tessellate>
    <curve>1</curve>
    <altitudeMode>absolute</altitudeMode>
    `
;


for (let i = 0; i < connections.length; i++){
  kml+=`<Placemark>
      <name>Curved Line</name>
      <styleUrl>#defaultLineStyle</styleUrl> <!-- Reference the default line style -->
      <LineString>
        <altitudeMode>absolute</altitudeMode> <!-- Ensure altitude mode is absolute -->
        <coordinates>
          ${coordinates.join(',')}
          ${connections[i].join(',')}
        </coordinates>
      </LineString>
    </Placemark>`
};

kml += `</Document>
      </kml>`;
  
  return kml;
}

// Load the JSON data
fetch('companyinfo.json')
  .then(response => response.json())
  .then(data => {
    // Store the JSON data
    const companyInfo = data;

    handler.setInputAction(function(click) {
      console.log("Left click detected"); // Debug statement to confirm click event

      // Check if the infoBox title element is available in the DOM
      let titleElement = document.querySelector('.cesium-infoBox-title');

      if (titleElement) {
        // Retrieve the title text
        let titleText = titleElement.textContent || titleElement.innerText;
        console.log("Title text:", titleText); // Debug statement to confirm title text

        // Extract the building number from the title text
        let buildingNumber = titleText;
        
        if (buildingNumber) {
          console.log("Building number:", buildingNumber); // Log the building number

          // Check if the building number exists in the JSON data
          if (companyInfo.hasOwnProperty(buildingNumber)) {
            console.log("Building found in companyinfo.json:", companyInfo[buildingNumber]);

            // Create KML string
            const kmlString = createKml(companyInfo[buildingNumber]);
            console.log("Generated KML:", kmlString); // Debug statement to confirm KML generation

            // Remove the current KML data source if it exists
            if (currentKmlDataSource) {
              viewer.dataSources.remove(currentKmlDataSource);
              currentKmlDataSource = null;
            }

            // Create a Blob from the KML string
            const kmlBlob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
            const kmlUrl = URL.createObjectURL(kmlBlob);

            // Load KML into Cesium
            currentKmlDataSource = new Cesium.KmlDataSource();
            currentKmlDataSource.load(kmlUrl).then(function() {
              viewer.dataSources.add(currentKmlDataSource);
              // Release the object URL after the KML has been loaded
              URL.revokeObjectURL(kmlUrl);
            });
          } else {
            console.log("Building number not found in companyinfo.json");

            // Remove the current KML data source if it exists
            if (currentKmlDataSource) {
              viewer.dataSources.remove(currentKmlDataSource);
              currentKmlDataSource = null;
            }
          }
        } else {
          console.log("Building number not found in title text"); // Debug statement if building number is not found

          // Remove the current KML data source if it exists
          if (currentKmlDataSource) {
            viewer.dataSources.remove(currentKmlDataSource);
            currentKmlDataSource = null;
          }
        }
      } else {
        console.log("Title element not found"); // Debug statement if the title element is not found

        // Remove the current KML data source if it exists
        if (currentKmlDataSource) {
          viewer.dataSources.remove(currentKmlDataSource);
          currentKmlDataSource = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  })
  .catch(error => console.error('Error loading companyinfo.json:', error));