const SerialPort = require('serialport')
const port = new SerialPort('COM3', {
  baudRate: 9600
})
var dataGlobal = null;

//Errores de apertura, escritura o lectura
port.on('error', function(err) {
  console.log('Error: ', err.message)
});


//servidor
const Hapi = require('@hapi/hapi');

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
	routes: {
		cors: true
	}
    });

    server.route({
        method: 'POST',
        path: '/send',
        handler: (request, h) => {
	    const datos = JSON.parse(request.payload).data;
	    //Escribir al puerto
	    port.write(datos, function(err) {
	    if (err) {
	      return console.log('Error on write: ', err.message)
	    }
	      console.log('Mensaje enviado')
	    });
	    const resPromise = new Promise((resolve,reject) => {
		//Lectura de datos
		port.on('readable', function () {
		  var lectura = port.read(5);
		  if(lectura){
			  data = lectura.toString();
			  console.log(data);
			  port.removeAllListeners('readable');
			  resolve({"resultado": data});
		  }
		})
	    });
            return resPromise.then(data => data);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();