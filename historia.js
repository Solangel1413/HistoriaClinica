document.addEventListener('DOMContentLoaded', function () {
    // Establecer fecha y hora actual al cargar la página
    actualizarFechaHora();
    
    // Actualizar fecha y hora cada minuto
    setInterval(actualizarFechaHora, 60000);
    
    // Calcular y establecer la edad automáticamente al seleccionar la fecha de nacimiento
    document.getElementById('fecha_nacimiento').addEventListener('change', calcularEdad);
    
    // Calcular IMC cuando cambia el peso o la talla
    document.getElementById('peso').addEventListener('input', calcularIMC);
    document.getElementById('talla').addEventListener('input', calcularIMC);
    
    // Botón para limpiar campos
    document.getElementById('clearFields').addEventListener('click', limpiarCampos);
    
    // Botón para exportar a PDF
    document.getElementById('exportPDF').addEventListener('click', exportarPDF);
    
    // Función para calcular la edad
    function calcularEdad() {
        let fechaNacimiento = new Date(document.getElementById('fecha_nacimiento').value);
        let hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        let mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }
        
        document.getElementById('edad').value = edad;
    }
    
    // Función para calcular el IMC
    function calcularIMC() {
        let peso = parseFloat(document.getElementById('peso').value);
        let tallaCm = parseFloat(document.getElementById('talla').value);
        
        if (!isNaN(peso) && !isNaN(tallaCm) && tallaCm > 0) {
            let tallaM = tallaCm / 100; // Convertir cm a metros
            let imc = peso / (tallaM * tallaM);
            document.getElementById('imc').value = imc.toFixed(2);
        } else {
            document.getElementById('imc').value = '';
        }
    }
    
    // Función para actualizar fecha y hora
    function actualizarFechaHora() {
        let ahora = new Date();
        let fecha = ahora.toISOString().split('T')[0];
        let horas = ahora.getHours().toString().padStart(2, '0');
        let minutos = ahora.getMinutes().toString().padStart(2, '0');
        let horaFormateada = `${horas}:${minutos}`;
        
        document.getElementById('fecha_atencion').value = fecha;
        document.getElementById('hora_atencion').value = horaFormateada;
    }
    
    // Función para limpiar todos los campos
    function limpiarCampos() {
        // Limpiar inputs de texto, número, fecha, hora y textareas
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], input[type="time"], textarea, select').forEach(input => {
            input.value = '';
        });
        
        // Desmarcar todos los radio buttons
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Restablecer selects a su primera opción
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Actualizar fecha y hora actual
        actualizarFechaHora();
    }
    
    // Función para exportar a PDF
    function exportarPDF() {
        // Ocultar temporalmente los campos vacíos
        const camposVacios = ocultarCamposVacios();
        
        // Ocultar botones durante la exportación
        const botonesContainer = document.querySelector('.button-group');
        botonesContainer.style.display = 'none';
        
        // Configuración para html2pdf
        const opciones = {
            margin: 10,
            filename: 'Historia_Clinica.pdf',
            image: { type: 'jpeg', quality: 1.0 },
            html2pdf: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a3', 
                orientation: 'portrait',
                compress: false
            }
        };
        
        // Crear una copia del contenido para exportar
        const contenido = document.querySelector('.form-container').cloneNode(true);
        const contenedor = document.createElement('div');
        contenedor.appendChild(contenido);
        contenedor.style.backgroundColor = 'white';
        contenedor.style.padding = '20px';
        
        // Añadir pie de página con fecha y hora de impresión
        const piePagina = document.createElement('div');
        piePagina.style.textAlign = 'center';
        piePagina.style.marginTop = '20px';
        piePagina.style.fontSize = '10px';
        piePagina.style.color = '#666';
        piePagina.innerHTML = `Documento generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`;
        contenedor.appendChild(piePagina);
        
        // Exportar a PDF
        // Asegúrate de que html2pdf esté disponible globalmente o importado correctamente
        if (typeof html2pdf !== 'undefined') {
            html2pdf()
                .from(contenedor)
                .set(opciones)
                .save()
                .then(() => {
                    // Restaurar la visibilidad de los campos y botones
                    restaurarCamposVacios(camposVacios);
                    botonesContainer.style.display = 'flex';
                })
                .catch(error => {
                    console.error('Error al generar PDF:', error);
                    alert('Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.');
                    restaurarCamposVacios(camposVacios);
                    botonesContainer.style.display = 'flex';
                });
        } else {
            console.error('html2pdf is not defined. Make sure it is properly imported or included in your project.');
            alert('html2pdf no está definido. Asegúrese de que esté correctamente importado o incluido en su proyecto.');
            restaurarCamposVacios(camposVacios);
            botonesContainer.style.display = 'flex';
        }
    }
    
    // Función para ocultar campos vacíos
    function ocultarCamposVacios() {
        const camposVacios = [];
        
        // Procesar inputs y textareas
        document.querySelectorAll('input, textarea, select').forEach(campo => {
            if (campo.type !== 'radio' && campo.type !== 'checkbox' && campo.value.trim() === '') {
                const grupo = campo.closest('.form-group');
                if (grupo) {
                    camposVacios.push({ elemento: grupo, display: grupo.style.display });
                    grupo.style.display = 'none';
                }
            }
        });
        
        // Procesar grupos de radio buttons
        document.querySelectorAll('.radio-group').forEach(grupo => {
            const radios = grupo.querySelectorAll('input[type="radio"]');
            const algunoSeleccionado = Array.from(radios).some(radio => radio.checked);
            
            if (!algunoSeleccionado) {
                const formGroup = grupo.closest('.form-group');
                if (formGroup) {
                    camposVacios.push({ elemento: formGroup, display: formGroup.style.display });
                    formGroup.style.display = 'none';
                }
            }
        });
        
        return camposVacios;
    }
    
    // Función para restaurar la visibilidad de los campos
    function restaurarCamposVacios(camposVacios) {
        camposVacios.forEach(item => {
            item.elemento.style.display = item.display;
        });
    }
    
    // Inicializar cálculos al cargar la página
    calcularIMC();
    if (document.getElementById('fecha_nacimiento').value) {
        calcularEdad();
    }
});