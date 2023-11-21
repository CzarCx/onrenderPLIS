var socket = io.connect('http://localhost:8080');
var list = document.querySelector('#lista-users');
var user = document.querySelector('#userName');
var userId = document.querySelector('#userId');
var modal = document.querySelector('#modal');
var username = window.location.pathname.replace('/chat/', '');
var clientes = [];

function conectarChat() {
  mostrarModal()
  var id = socket.id;
  console.log('id:', socket.id, 'username:', username);
  var input = '';
  var info = '';
  input = username;
  info = socket.id
  user.innerHTML = input;
  userId.innerHTML = info;
  modal.innerHTML = input; 
  $.post('/login', { username: username, id: id }, function (data) {
    console.log(data);
    clientes = data;
    list.innerHTML += 'Cargando...';
    var html = '';
    var modali= ''; 
    clientes.forEach(function (cliente) {
      html += '<li>' + cliente.username + '</li>';
    });
    modali += '<p id="status-modal">Esperando...</p>';
    list.innerHTML = html;
    modal.innerHTML = modali;
    $('.loader').hide();
  });
}

function enviarCliente(e){
  $.post('/send', {
    text: msg,
    username: username,
    id: socket.id
  }, function (data) {
    document.querySelector('#input').value = '';
  });
}
function enviarMensajeClick() {
  enviarMensaje({ which: 13 }); 
}
function enviarMensaje(e) {
  if (e.which != 13) return;
  var msg = document.querySelector('#input').value;
  if (msg.length <= 0) return;
  $.post('/send', {
    text: msg,
    username: username,
    id: socket.id
  }, function (data) {
    document.querySelector('#input').value = '';
  });
}

socket.on('mensaje', function (data) {
  data.username = data.username.replace('</', '');
  var sanitized = data.msg.replace(/<\/?[^>]+(>|$)/g, '').trim(); 

  if (sanitized.length === 0) {
    return;
  }
  var fecha = new Date();
  var hora = fecha.getHours();
  var minutos = fecha.getMinutes();
  var periodo = (hora >= 12) ? 'p. m.' : 'a. m.';
  
  hora = (hora % 12 === 0) ? 12 : hora % 12;
  minutos = (minutos < 10) ? '0' + minutos : minutos;
  
  var horaFormateada = `${hora}:${minutos} ${periodo}`;

  if (data.id == socket.id) {
    var msj = `
    <div class="local-message">
      <strong>${data.username}</strong>
      <p>${insertarSaltosDeLinea(sanitized)}</p>
      <p id="date-message">${horaFormateada} </p>
    </div>
    `;
    document.querySelector('.mensajes-container').innerHTML += msj;
  } else {
    var msj = `
    <div class="remote-message">
      <strong>${data.username} </strong>
      <p>${insertarSaltosDeLinea(sanitized)}</p>
      <p id="date-message"><strong id="idUsaerin">${data.id}</strong>${horaFormateada}</p>
    </div>
    `;
    mostrarModal('<p id="status-modal">'+ data.username + " envió un mensaje"+ "</p>"); 
    document.querySelector('.mensajes-container').innerHTML += msj;
  }
});

function insertarSaltosDeLinea(texto) {
  const longitudLinea = 50;
  let resultado = '';

  for (let i = 0; i < texto.length; i += longitudLinea) {
    resultado += texto.substr(i, longitudLinea) + '<br>';
  }

  return resultado;
}


socket.on('socket_desconectado', function (data) {
  console.log(data);
  clientes = clientes.filter(function (cliente) {
    console.log(cliente);
    return cliente.id != data.id;
  });
  list.innerHTML += 'Cargando...';
  var html = '';
  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });
  list.innerHTML = html;
});

socket.on('socket_conectado', function (data, id) {
  console.log(data);
  clientes.push(data);
  list.innerHTML += 'Cargando...';
  var html = '';

  clientes.forEach(function (cliente) {
    html += '<li>' + cliente.username + '</li>';
  });

  var inputElement = document.querySelector('#input');
  inputElement.addEventListener('input', function() {
    // Obtén el valor del input
    var inputValue = inputElement.value.trim();

    if (inputValue.length > 0) {
      mostrarModal('<p id="status-modal">' + 'Estás escribiendo...' + '</p>');
      socket.emit('notificar', data);
      console.log('holiiii');
    } else {
    }
  });

  mostrarModal('<p id="status-modal">' + data.username + " se unio a la conversación" + '</p>');

  list.innerHTML = html;
});


/*
socket.on('socket_conectado', (id) =>{
  socket.emit('notificar', id);
  mostrarModal("puto")
});
*/
socket.on('notify', (id) =>{

  console.log('SAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + id);
  mostrarModal('<p id="status-modal">'+id + '<br>' +' esta escribiendo...' + '</p>');
})
/*
socket.on('notify', (id) =>{
  var inputElement = document.querySelector('#input');
  inputElement.addEventListener('input', function() {
    mostrarModal('<p>'+id + ' está escribiendo...' + '</p>');
  });
  console.log('hola');

})
*/
/*
socket.on('escribiendo', function (data) {
  var inputElement = document.querySelector('#input');
  inputElement.addEventListener('input', function() {
    mostrarModal('<p>'+data.username + ' está escribiendo...' + '</p>');
  });
});
*/
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(cerrarModal, 5000);
});

function mostrarModal(texto) {
  var modal = document.getElementById("modal");
  modal.innerHTML = texto;
  modal.style.display = "block";
  modal.addEventListener("click", function() {
    cerrarModal();
  });

  setTimeout(function() {
    modal.style.opacity = "1";
  }, 100);
}

function cerrarModal() {
  var modal = document.getElementById("modal");
  modal.style.opacity = "0";
  setTimeout(function() {
    modal.style.display = "none";
  }, 1000);
}



function mostrarEstadoEscribiendo(username) {
  mostrarModal('<p>'+username + ' está escribiendo...' + '</p>');
  console.log(username + ' está escribiendo...');
}


