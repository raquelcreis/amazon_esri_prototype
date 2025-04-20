require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer"
], function (Map, MapView, GeoJSONLayer) {

    /* ======================== Load JSON Data ======================== */

    fetch('pop_up_text.json')
        .then(response => response.json())
        .then(countryData => {

            /* ======================== GeoJSON Layer ======================== */

            // Create the GeoJSON layer for Pan-Amazon countries
            const panAmazoniaLayer = new GeoJSONLayer({
                url: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
                title: "Pan-Amazon Region (Proxy)",
                definitionExpression: "name IN ('Brazil', 'Colombia', 'Peru', 'Bolivia', 'Ecuador', 'Venezuela', 'Guyana', 'Suriname')",
                popupTemplate: {
                    title: "{name}",
                    content: function (event) {
                        const countryName = event.graphic.attributes.name;
                        const countryInfo = countryData[countryName];

                        if (countryInfo) {
                            return `
                                <strong>${countryName}</strong><br>
                                <b>Area:</b> ${countryInfo.total_area}<br>
                                <b>Population:</b> ${countryInfo.population}<br>
                                <b>Capital:</b> ${countryInfo.capital}
                            `;
                        } else {
                            return "No data available for this country.";
                        }
                    },
                    // Remove default actions, including Zoom To
                    includeDefaultActions: false, // This disables the default actions like Zoom To
                },
                renderer: {
                    type: "simple",
                    symbol: {
                        type: "simple-fill",
                        color: [34, 139, 34, 0.2], // Light green color
                        outline: {
                            color: [0, 100, 0, 1],   // Dark green for outline
                            width: 2
                        }
                    }
                }
            });

            /* ======================== Map and View Setup ======================== */

            const map = new Map({
                basemap: "topo-vector",
                layers: [panAmazoniaLayer]
            });

            const view = new MapView({
                container: "viewDiv",  // The ID of the container in the HTML
                map: map,
                center: [-63, -3],     // Initial map coordinates
                zoom: 4                // Initial zoom level
            });

            /* ======================== Popup Configuration ======================== */

            // Function to zoom to the country and show the popup
            function zoomAndShowPopup(countryName) {
                panAmazoniaLayer.queryFeatures({
                    where: `name = '${countryName}'`,
                    returnGeometry: true,
                    outFields: ["*"]
                }).then(function (results) {
                    const feature = results.features[0];
                    if (feature) {
                        let zoomLevel = 5; // Default zoom level for all countries

                        // Zoom to the country geometry
                        view.goTo({
                            target: feature.geometry.extent.expand(1.5), // Zoom with a small 1.5x increase
                            zoom: zoomLevel // Apply specific zoom level
                        });

                        // Open the popup with the country name
                        view.popup.open({
                            title: feature.attributes.name,
                            content: `
                                <b>Area:</b> ${countryData[countryName].total_area}<br>
                                <b>Population:</b> ${countryData[countryName].population}<br>
                                <b>Capital:</b> ${countryData[countryName].capital}
                            `,
                            location: feature.geometry.centroid || feature.geometry,
                            // Ensure no Zoom To action is present
                            actions: [] // Alternatively, you can use actions to customize further
                        });
                    }
                });
            }

            /* ======================== Event Listeners for Buttons ======================== */

            // Add event listeners for the buttons
            document.getElementById("btn-brazil").addEventListener("click", function () {
                zoomAndShowPopup("Brazil");
            });

            document.getElementById("btn-colombia").addEventListener("click", function () {
                zoomAndShowPopup("Colombia");
            });

            document.getElementById("btn-peru").addEventListener("click", function () {
                zoomAndShowPopup("Peru");
            });

            document.getElementById("btn-bolivia").addEventListener("click", function () {
                zoomAndShowPopup("Bolivia");
            });

            document.getElementById("btn-ecuador").addEventListener("click", function () {
                zoomAndShowPopup("Ecuador");
            });

            document.getElementById("btn-venezuela").addEventListener("click", function () {
                zoomAndShowPopup("Venezuela");
            });

            document.getElementById("btn-guyana").addEventListener("click", function () {
                zoomAndShowPopup("Guyana");
            });

            document.getElementById("btn-suriname").addEventListener("click", function () {
                zoomAndShowPopup("Suriname");
            });

            /* ======================== Zoom and Popup for Country Click ======================== */

            // Add event listener for the country click in the map view
            panAmazoniaLayer.on("click", function (event) {
                const countryName = event.graphic.attributes.name;
                zoomAndShowPopup(countryName);
            });

        })
        .catch(error => console.error('Error loading JSON:', error));

});
