const modal_propio = document.getElementById('cosa_propio');

document.addEventListener('DOMContentLoaded', function() {
    const bienvenidaDiv = document.getElementById('bienvenida');
    const mensaje = 'Bienvenido';
    
    let i = 0;
    function mostrarLetra() {
        if (i < mensaje.length) {
            bienvenidaDiv.innerHTML += mensaje.charAt(i);
            i++;
            setTimeout(mostrarLetra, 100); // Ajusta la velocidad de escritura aquí
        }
    }

    mostrarLetra();
});

function ayuda(){
    modal_propio.classList.add('d-block');
    modal_propio.classList.remove('d-none');
}

function cerrarAyuda(){
    modal_propio.classList.add('d-none');
    modal_propio.classList.remove('d-block');
}