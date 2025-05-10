require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Legend",
    "esri/geometry/Extent"
], function (WebMap, MapView, Legend, Extent) {

    // Create the WebMap from the portal item ID
    const webmap = new WebMap({
        portalItem: {
            id: "21308afcb904478dbb1ff414f85e48e9"
        }
    });

    // Create the map view
    const view = new MapView({
        container: "viewDiv",
        map: webmap,
        center: [-60, -4], // Approximate center of the Amazon region
        zoom: 4
    });

    // Approximate center coordinates and zoom level for each country
    const countryViewpoints = {
        brazil: { center: [-54, -10], zoom: 6 },
        colombia: { center: [-74, 4], zoom: 7 },
        peru: { center: [-75, -10], zoom: 6 },
        bolivia: { center: [-64, -16], zoom: 6 },
        ecuador: { center: [-78.5, -1.5], zoom: 6 },
        venezuela: { center: [-66, 7], zoom: 6 },
        guyana: { center: [-59, 5], zoom: 6 },
        suriname: { center: [-56, 4], zoom: 6 }
    };

    // When the WebMap is ready, add the toggle control and event handlers
    view.when(() => {
        // Find the Indigenous Territories layer by its title
        const territoriosIndigenasLayer = webmap.layers.find(layer =>
            layer.title.includes("Terra Indígena") || layer.title.includes("Território Indígena")
        );

        // Synchronize the toggle checkbox state with the layer visibility
        const toggleTI = document.getElementById("toggleTI");
        if (territoriosIndigenasLayer && toggleTI) {
            toggleTI.checked = territoriosIndigenasLayer.visible;
            toggleTI.addEventListener("calciteSwitchChange", (event) => {
                territoriosIndigenasLayer.visible = event.target.checked;
            });
        }

        // Add the legend to the map view
        const legend = new Legend({
            view: view
        });
        view.ui.add(legend, "bottom-left");

        // Add event listeners to the country buttons to update the map view
        Object.keys(countryViewpoints).forEach(country => {
            const btn = document.getElementById(`btn-${country}`);
            if (btn) {
                btn.addEventListener("click", () => {
                    const vp = countryViewpoints[country];
                    view.goTo({
                        center: vp.center,
                        zoom: vp.zoom
                    });
                });
            }
        });
    });
});
