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

    // Configuração dos pontos de visualização para cada país
    const countryViewpoints = {
        brazil: { center: [-54, -10], zoom: 6 },
        colombia: { center: [-74, 4], zoom: 7 },
        peru: { center: [-75, -10], zoom: 6 },
        bolivia: { center: [-64, -16], zoom: 6 },
        ecuador: { center: [-78.5, -1.5], zoom: 6 },
        venezuela: { center: [-66, 7], zoom: 6 }
    };

    // Configuração dos vídeos para cada país
    const countryVideos = {
        brazil: "https://www.youtube.com/embed/d3bFJopp3Ws?si=-4IAme1EGEsk1-Xy",
        colombia: "https://www.youtube.com/embed/5DgbFD-yeBU?si=CB1B178pivBa6wCG",
        peru: "https://www.youtube.com/embed/vfYyqVVNGeM?si=5EAHTluAMIJhX2d6",
        bolivia: "https://www.youtube.com/embed/TvJsXwi1Fno?si=jF3kGePq4Z9xev1l",
        ecuador: "https://www.youtube.com/embed/l2LLMYIYWAA?si=umhqLdjvESYbOvnP",
        venezuela: "https://www.youtube.com/embed/285dodhBt-k?si=4YauSoCes1wyBqnP"
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

        // Adiciona event listeners para cada botão de país
        Object.keys(countryViewpoints).forEach(country => {
            const btn = document.getElementById(`btn-${country}`);
            if (btn) {
                btn.addEventListener("click", () => {
                    const vp = countryViewpoints[country];
                    view.goTo({ center: vp.center, zoom: vp.zoom });
                    showVideo(country);
                });
            }
        });
    });
});

// Mostrar o vídeo do YouTube específico para cada país
function showVideo(country) {
    const container = document.getElementById("videoContainer");
    const iframe = document.getElementById("youtubeFrame");

    // Videos para cada país
    const countryVideos = {
        brazil: "https://www.youtube.com/embed/d3bFJopp3Ws?si=-4IAme1EGEsk1-Xy&autoplay=1",
        colombia: "https://www.youtube.com/embed/5DgbFD-yeBU?si=CB1B178pivBa6wCG&autoplay=1",
        peru: "https://www.youtube.com/embed/vfYyqVVNGeM?si=5EAHTluAMIJhX2d6&autoplay=1",
        bolivia: "https://www.youtube.com/embed/TvJsXwi1Fno?si=jF3kGePq4Z9xev1l&autoplay=1",
        ecuador: "https://www.youtube.com/embed/l2LLMYIYWAA?si=umhqLdjvESYbOvnP&autoplay=1",
        venezuela: "https://www.youtube.com/embed/285dodhBt-k?si=4YauSoCes1wyBqnP&autoplay=1"
    };

    // Configura o iframe com o vídeo do país selecionado
    iframe.src = countryVideos[country];
    container.classList.remove("hidden");
}

// Esconder o vídeo
function hideVideo() {
    const container = document.getElementById("videoContainer");
    container.classList.add("hidden");

    const iframe = document.getElementById("youtubeFrame");
    iframe.src = ""; // Remove o vídeo para que ele pare completamente
}