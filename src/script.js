var user_id = localStorage.getItem("user_id");
var username = localStorage.getItem("username");

const regex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

var inputMes = document.getElementById('monthSelector');
// Obtener la fecha actual
var fechaActual = new Date();
// Calcular el último mes
var ultimoMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth());
// Formatear la fecha al formato YYYY-MM para establecerla como valor por defecto
var ultimoMesFormateado = ultimoMes.toISOString().slice(0, 7);
// Establecer el valor por defecto en el input
inputMes.value = ultimoMesFormateado;

function limpiarTabla() {
    var cuerpoTabla = document.getElementById('cuerpoTabla');
    cuerpoTabla.innerHTML = ''; // Eliminar solo el contenido del tbody
}

function agregarDatosATabla(datos) {
    limpiarTabla(); // Limpia los datos existentes antes de agregar nuevos

    var cuerpoTabla = document.getElementById('cuerpoTabla');

    datos.forEach(function (dato) {
        var fila = cuerpoTabla.insertRow();

        Object.values(dato).forEach(function (valor) {
            var celda = fila.insertCell();
            celda.textContent = valor;
        });
    });
}

function fetchToData(uname) {
    var dateString = document.getElementById('monthSelector').value;
    var dateParts = dateString.split("-"); // Dividir la cadena en partes usando el separador "-"
    var year = parseInt(dateParts[0]); // Obtener el año
    var month = parseInt(dateParts[1]); // Obtener el mes

    const url = `https://mis-cuentas-api.crennaanalytica.com.ar/data?user=${uname}&month=${month}&year=${year}`;

    // Realizar la solicitud GET utilizando fetch
    fetch(url)
        .then(response => {
            // Verificar si la solicitud fue exitosa (código de estado HTTP 200-299)
            if (!response.ok) {
                throw new Error('Ocurrió un error al obtener los datos');
            }
            // Parsear la respuesta a JSON
            return response.json();
        })
        .then(data => {
            // Utilizar los datos obtenidos
            data = data.response

            var final = []

            data.forEach(function (d) {
                var cyear = parseInt(d.year); // Obtener el año
                var cmonth = parseInt(d.month); // Obtener el mes

                if (cyear == year && cmonth == month) {
                    var fecha = d.day + "/" + d.month + "/" + d.year;
                    var tempArray = [fecha, d.hour, d.detail, d.bank, d.category, d.type, d.price]
                    final.push(tempArray);
                }
            })

            agregarDatosATabla(final);
        })
        .catch(error => {
            // Capturar y manejar errores de la solicitud
            console.error('Error:', error);
        });
}


document.getElementById("openSession").addEventListener("click", function (e) {
    e.preventDefault();
    var dialog = document.getElementById("openSessionDialog");
    const user_ = document.getElementById('user').value;
    const password = document.getElementById('pass').value;
    var error = document.getElementById("error");

    if (user_ == "" || pass == "") {
        error.innerHTML = "Los campos de usuario y contraseña deben estar completos.";
        return;
    }   

    // Preparar los parámetros para la solicitud GET
    const params = new URLSearchParams({
        mail: user_,
        password: password
    });

    // Construir la URL con los pará metros
    const url = `https://mis-cuentas-api.crennaanalytica.com.ar/login?${params}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }
            // Retornar los datos en formato JSON
            return response.json();
        })
        .then(data => {
            var id_ = data.response[0].id;
            var username_ = data.response[0].username;

            if(id_ != undefined){
                localStorage.setItem("user_id", id_);
                localStorage.setItem("username", username_);
                dialog.close()
                fetchToData(username_);
            }else{
                error.innerHTML = 'Credenciales inválidas';
            }
            
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('error').textContent = 'Credenciales inválidas'; // Mostrar un mensaje de error en el HTML
        });


});

document.getElementById("goToMonth").addEventListener("click", function (e) {
    var inputMes = document.getElementById('monthSelector');

    var valor = inputMes.value;
    console.log(valor)
});

document.getElementById("goToMonth").addEventListener("click", function () {
    fetchToData();
})

document.getElementById('agregar').addEventListener('click', () => {
    const detail = document.getElementById('detail').value;
    const bank = document.getElementById('bank').value;
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const price = document.getElementById('q').value;

    // Obtener la fecha y hora actual
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // El mes es devuelto de 0 a 11, sumamos 1 para obtener el mes actual
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0'); // Formatear la hora a HH
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Formatear los minutos a MM
    const hour = `${hours}:${minutes}`;

    // Preparar los parámetros para la solicitud POST
    const params = new URLSearchParams({
        user_id: user_id,
        day: day,
        month: month,
        year: year,
        hour: hour,
        detail: detail,
        bank: bank,
        type: type,
        category: category,
        price: price
    });

    // Realizar la solicitud POST utilizando fetch()
    fetch('https://mis-cuentas-api.crennaanalytica.com.ar/insert?' + params, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ocurrió un error al insertar los datos');
            }
            console.log('Datos insertados correctamente');
            fetchToData(username);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById("closeSession").addEventListener("click", function(){
    localStorage.clear();
    location.reload();
})

if(username != undefined){
    document.getElementById("openSessionDialog").close();
    fetchToData(username);
}
