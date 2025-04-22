require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer"
], function (Map, MapView, GeoJSONLayer) {

    // Create the map with basemap
    const map = new Map({
        basemap: "topo-vector"
    });

    // Create the map view
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-63, -3],
        zoom: 4
    });

    // Wait for the view to load
    view.when(function () {
        console.log("Map view loaded successfully");

        // Load country data after map view is ready
        loadCountryData();
    }, function (error) {
        console.error("Error loading map view:", error);
    });

    function loadCountryData() {
        // Load additional country information for the popup and side panel from JSON files
        Promise.all([
            fetch('data/pop_up_text.json').then(response => response.json()),
            fetch('data/side_panel_text.json').then(response => response.json())
        ])
            .then(([countryDataForPopup, countryDataForSidePanel]) => {
                console.log("Country data loaded successfully");

                // Create the GeoJSON layer for Pan-Amazon countries
                const panAmazoniaLayer = new GeoJSONLayer({
                    url: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
                    title: "Pan-Amazon Region (Proxy)",
                    definitionExpression: "name IN ('Brazil', 'Colombia', 'Peru', 'Bolivia', 'Ecuador', 'Venezuela', 'Guyana', 'Suriname')",
                    renderer: {
                        type: "simple",
                        symbol: {
                            type: "simple-fill",
                            color: [34, 139, 34, 0.2], // Light green fill
                            outline: {
                                color: [0, 100, 0, 1],   // Dark green border
                                width: 2
                            }
                        }
                    }
                });

                // Add the layer to the map
                map.add(panAmazoniaLayer);

                // Get custom popup element
                const customPopup = document.getElementById("customPopup");
                const infoPanel = document.getElementById("infoPanel");
                const countryDetails = document.getElementById("countryDetails");
                const closePanelBtn = document.getElementById("closePanelBtn");

                // Flag URLs for each country
                const flagUrls = {
                    "Brazil": "https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg",
                    "Colombia": "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg",
                    "Peru": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Peru.svg",
                    "Bolivia": "https://upload.wikimedia.org/wikipedia/commons/4/48/Flag_of_Bolivia.svg",
                    "Ecuador": "https://upload.wikimedia.org/wikipedia/commons/e/e8/Flag_of_Ecuador.svg",
                    "Venezuela": "https://upload.wikimedia.org/wikipedia/commons/0/06/Flag_of_Venezuela.svg",
                    "Guyana": "https://upload.wikimedia.org/wikipedia/commons/9/99/Flag_of_Guyana.svg",
                    "Suriname": "https://upload.wikimedia.org/wikipedia/commons/6/60/Flag_of_Suriname.svg"
                };

                // Function to show custom popup
                function showCustomPopup(screenPoint, countryName) {
                    const data = countryDataForPopup[countryName];

                    if (data) {
                        // Create popup content
                        customPopup.innerHTML = `
                            <div class="custom-popup-header">
                                <img src="${flagUrls[countryName]}" class="custom-popup-flag" alt="${countryName} Flag">
                                ${countryName}
                                <button class="custom-popup-close">×</button>
                            </div>
                            <div class="custom-popup-content">
                                <div class="custom-popup-item">
                                    <span class="custom-popup-label">Area:</span>
                                    <span class="custom-popup-value">${data.total_area}</span>
                                </div>
                                <div class="custom-popup-item">
                                    <span class="custom-popup-label">Population:</span>
                                    <span class="custom-popup-value">${data.population}</span>
                                </div>
                                <div class="custom-popup-item">
                                    <span class="custom-popup-label">Capital:</span>
                                    <span class="custom-popup-value">${data.capital}</span>
                                </div>
                            </div>
                        `;

                        // Position the popup
                        customPopup.style.left = `${screenPoint.x}px`;
                        customPopup.style.top = `${screenPoint.y}px`;
                        customPopup.style.display = "block";

                        // Add close button event listener
                        const closeBtn = customPopup.querySelector(".custom-popup-close");
                        closeBtn.addEventListener("click", function () {
                            customPopup.style.display = "none";
                        });

                        // Also update the side panel
                        const sidePanelData = countryDataForSidePanel[countryName];
                        if (sidePanelData) {
                            countryDetails.innerHTML = `
                                <h3>${countryName}</h3>
                                <p><strong>Description:</strong> ${sidePanelData.description}</p>
                                <p><strong>Important Species:</strong> ${sidePanelData.important_species.join(', ')}</p>
                                <p><strong>Protected Areas:</strong> ${sidePanelData.protected_areas}</p>
                            `;
                            infoPanel.hidden = false;
                        }
                    }
                }

                // Hide popup when view changes
                view.watch("extent", function () {
                    customPopup.style.display = "none";
                });

                // Variables for highlight
                let highlightHandle = null;
                let panAmazoniaLayerView = null;

                view.whenLayerView(panAmazoniaLayer).then(function (layerView) {
                    panAmazoniaLayerView = layerView;
                });

                // Function to zoom and open a popup for a specific country
                function zoomAndShowPopup(countryName) {
                    panAmazoniaLayer.queryFeatures({
                        where: `name = '${countryName}'`,
                        returnGeometry: true,
                        outFields: ["*"]
                    }).then(function (results) {
                        const feature = results.features[0];
                        if (feature) {
                            // Remove highlight anterior, se existir
                            if (highlightHandle) {
                                highlightHandle.remove();
                                highlightHandle = null;
                            }

                            // Aplica o highlight no feature selecionado
                            if (panAmazoniaLayerView) {
                                highlightHandle = panAmazoniaLayerView.highlight(feature);
                            }

                            const geometry = feature.geometry;

                            view.goTo({
                                target: geometry.extent.expand(1.5),
                                zoom: 5
                            }).then(function () {
                                // After zoom completes, convert geometry center to screen coordinates
                                const center = geometry.centroid || geometry.extent.center;
                                const screenPoint = view.toScreen(center);

                                // Show custom popup at the screen coordinates
                                showCustomPopup(screenPoint, countryName);
                            });
                        }
                    });
                }

                // Button listeners for each country
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

                // Enable click on map features to trigger zoom and popup
                view.on("click", function (event) {
                    // Hide any existing popup
                    customPopup.style.display = "none";

                    view.hitTest(event).then(function (response) {
                        const graphic = response.results.find(result => {
                            return result.graphic && result.graphic.layer === panAmazoniaLayer;
                        });

                        if (graphic) {
                            const countryName = graphic.graphic.attributes.name;
                            zoomAndShowPopup(countryName);
                        }
                    });
                });

                // Hide side panel on button click
                closePanelBtn.addEventListener("click", () => {
                    infoPanel.hidden = true;
                    if (highlightHandle) {
                        highlightHandle.remove();
                        highlightHandle = null;
                    }
                });

            })
            .catch(error => console.error('Error loading JSON:', error));
    }
});