require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Legend"
], function (WebMap, MapView, Legend) {

    const webmap = new WebMap({
        portalItem: { id: "21308afcb904478dbb1ff414f85e48e9" }
    });

    const view = new MapView({
        container: "viewDiv",
        map: webmap,
        center: [-60, -4],
        zoom: 4
    });

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

    view.when(() => {
        const territoriosIndigenasLayer = webmap.layers.find(layer =>
            layer.title.includes("Terra Indígena") || layer.title.includes("Território Indígena")
        );

        const toggleTI = document.getElementById("toggleTI");
        if (territoriosIndigenasLayer && toggleTI) {
            toggleTI.checked = territoriosIndigenasLayer.visible;
            toggleTI.addEventListener("calciteSwitchChange", (event) => {
                territoriosIndigenasLayer.visible = event.target.checked;
            });
        }

        const legend = new Legend({ view: view });
        view.ui.add(legend, "bottom-left");

        Object.keys(countryViewpoints).forEach(country => {
            const btn = document.getElementById(`btn-${country}`);
            if (btn) {
                btn.addEventListener("click", () => {
                    const vp = countryViewpoints[country];
                    view.goTo({ center: vp.center, zoom: vp.zoom });
                    showVideo();
                });
            }
        });
    });
});

// Mostrar o vídeo do YouTube
function showVideo() {
    const container = document.getElementById("videoContainer");
    const iframe = document.getElementById("youtubeFrame");

    // Força recarregamento do vídeo
    iframe.src = "https://www.youtube.com/embed/d3bFJopp3Ws?autoplay=1";
    container.classList.remove("hidden");
}

// Esconder o vídeo
function hideVideo() {
    const container = document.getElementById("videoContainer");
    container.classList.add("hidden");

    const iframe = document.getElementById("youtubeFrame");
    iframe.src = ""; // Remove o vídeo para que ele pare completamente
}
