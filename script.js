require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer"
], function (Map, MapView, GeoJSONLayer) {

    // Load additional country information for the popup and side panel from JSON files
    Promise.all([
        fetch('data/pop_up_text.json').then(response => response.json()),
        fetch('data/side_panel_text.json').then(response => response.json())
    ])
        .then(([countryDataForPopup, countryDataForSidePanel]) => {

            // Create the GeoJSON layer for Pan-Amazon countries
            const panAmazoniaLayer = new GeoJSONLayer({
                url: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
                title: "Pan-Amazon Region (Proxy)",
                definitionExpression: "name IN ('Brazil', 'Colombia', 'Peru', 'Bolivia', 'Ecuador', 'Venezuela', 'Guyana', 'Suriname')",
                popupTemplate: {
                    title: "{name}",
                    content: function (event) {
                        const countryName = event.graphic.attributes.name;
                        const countryInfo = countryDataForPopup[countryName];

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
                    includeDefaultActions: false
                },
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

            // Initialize the map with the base map and layers
            const map = new Map({
                basemap: "topo-vector",
                layers: [panAmazoniaLayer]
            });

            // Initialize the map view
            const view = new MapView({
                container: "viewDiv",  // This must match the HTML element ID
                map: map,
                center: [-63, -3],
                zoom: 4
            });

            // Variáveis para highlight
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
                        const attributes = feature.attributes;
                        const data = countryDataForPopup[countryName];

                        view.goTo({
                            target: geometry.extent.expand(1.5),
                            zoom: 5
                        });

                        view.popup.open({
                            title: attributes.name,
                            content: `
                            <b>Area:</b> ${data.total_area}<br>
                            <b>Population:</b> ${data.population}<br>
                            <b>Capital:</b> ${data.capital}
                        `,
                            location: geometry.centroid || geometry,
                            actions: []
                        });

                        // Atualiza painel lateral...
                        if (data) {
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
            panAmazoniaLayer.on("click", function (event) {
                const countryName = event.graphic.attributes.name;
                zoomAndShowPopup(countryName);
            });

        })
        .catch(error => console.error('Error loading JSON:', error));

    // Side panel controls
    const infoPanel = document.getElementById("infoPanel");
    const countryDetails = document.getElementById("countryDetails");
    const closePanelBtn = document.getElementById("closePanelBtn");

    // Hide side panel on button click
    closePanelBtn.addEventListener("click", () => {
        infoPanel.hidden = true;
        if (highlightHandle) {
            highlightHandle.remove();
            highlightHandle = null;
        }
    });

});
