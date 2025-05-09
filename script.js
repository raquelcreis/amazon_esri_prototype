require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Legend",
    "esri/geometry/Extent"
], function (WebMap, MapView, Legend, Extent) {

    // Cria o WebMap diretamente a partir da ID
    const webmap = new WebMap({
        portalItem: {
            id: "21308afcb904478dbb1ff414f85e48e9"
        }
    });

    // Cria a visualização do mapa
    const view = new MapView({
        container: "viewDiv",
        map: webmap,
        center: [-60, -4], // Centro aproximado da Amazônia
        zoom: 4
    });

    // Coordenadas aproximadas para cada país (centro e zoom)
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

    // Quando o WebMap estiver pronto, adiciona o controle de toggle
    view.when(() => {
        // Busca a camada de Territórios Indígenas pelo título
        const territoriosIndigenasLayer = webmap.layers.find(layer =>
            layer.title.includes("Terra Indígena") || layer.title.includes("Território Indígena")
        );

        const toggleTI = document.getElementById("toggleTI");
        if (territoriosIndigenasLayer && toggleTI) {
            toggleTI.checked = territoriosIndigenasLayer.visible; // Sincronia inicial
            toggleTI.addEventListener("calciteSwitchChange", (event) => {
                territoriosIndigenasLayer.visible = event.target.checked;
            });
        }

        // Adiciona a legenda
        const legend = new Legend({
            view: view
        });
        view.ui.add(legend, "bottom-left");

        // Adiciona evento aos botões de país para zoom
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
