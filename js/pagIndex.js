
//------------- INDEX PÁGINA -------------
if (window.location.pathname.endsWith('index.html')) { // Llamar a la función solo si estamos en la página "datos.html"

    async function request() {
        var elementosHoy = document.getElementById("numHoy");
        var hoy = new Date().toISOString().split('T')[0];
        var API = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${hoy}&end_date=${hoy}&api_key=DEMO_KEY`;

        var response = await fetch(API);

        var data = await response.text();
        var datos = JSON.parse(data);
        console.log(datos);

        elementosHoy.innerHTML = datos.element_count;
    }

    request();
}