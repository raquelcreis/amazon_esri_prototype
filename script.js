require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer"
], function (Map, MapView, GeoJSONLayer) {

    // Criação da camada GeoJSON com os países da Pan-Amazônia
    const panAmazoniaLayer = new GeoJSONLayer({
        url: "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson",
        title: "Região Pan-Amazônica (Proxy)",
        definitionExpression: "name IN ('Brazil', 'Colombia', 'Peru', 'Bolivia', 'Ecuador', 'Venezuela', 'Guyana', 'Suriname')",
        popupTemplate: {
            title: "{name}",
            content: "País pertencente à região Pan-Amazônica."
        },
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: [34, 139, 34, 0.2], // Cor verde translúcida
                outline: {
                    color: [0, 100, 0, 1],   // Cor verde escuro para o contorno
                    width: 2
                }
            }
        }
    });

    // Criação do mapa e da visualização
    const map = new Map({
        basemap: "topo-vector",
        layers: [panAmazoniaLayer]
    });

    const view = new MapView({
        container: "viewDiv",  // ID do container no HTML
        map: map,
        center: [-63, -3],     // Coordenadas iniciais do mapa
        zoom: 4                // Nível de zoom inicial
    });

    // Remover as ações padrão do popup (como "Zoom para")
    view.popup.actions = [];

    // Função que realiza o zoom no país e exibe o popup
    function zoomAndShowPopup(countryName) {
        panAmazoniaLayer.queryFeatures({
            where: `name = '${countryName}'`,
            returnGeometry: true,
            outFields: ["*"]
        }).then(function (results) {
            const feature = results.features[0];
            if (feature) {
                // Realizar zoom na geometria do país
                view.goTo(feature.geometry.extent.expand(1.5)); // Zoom com um pequeno aumento de 1.5x
                // Abrir o popup com o nome do país
                view.popup.open({
                    title: feature.attributes.name,
                    content: `<b>País pertencente à região Pan-Amazônica.</b>`,
                    location: feature.geometry.centroid || feature.geometry
                });
            }
        });
    }

    // Adicionando event listeners para os botões
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
});
