function buscar() {
    var fechaDesde = document.getElementById('desde').value;
    // Obtener el valor del campo de fecha seleccionada por el usuario
    var fechaHasta = document.getElementById('hasta').value;
    var fechaActual = new Date().toISOString().split('T')[0];

    // Comparar las fechas
    if (fechaDesde != '' && fechaHasta != '') {
        if (fechaDesde <= fechaHasta) {
            if (fechaHasta <= fechaActual) {
                window.location.href = `./html/datos.html?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`;
            } else {
                alert('La fecha de búsqueda debe ser igual o anterior al día de hoy.');
            }
        } else {
            alert('La fecha de inicio de búsqueda debe ser igual o inferor a la fecha de fin de búsqueda.');
        }
    } else {
        alert("Para buscar debe elegir un margen de fechas.");
    }
}

function volver() {
    window.location.href = "../index.html";
}

function almacen() {
    window.location.href = "./html/almacen.html";
}

function guardar() {
    window.location.href = "./almacen.html";
}

