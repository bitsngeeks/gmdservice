// Configuracion Base
// =============================================================================

//Se establecen los paquetes que se necesitan
var express    = require('express');    // Se realiza la instancia de express
var app        = express();    // Se engloba la aplicacion express dentro de la variable global
var bodyParser = require('body-parser');       
var config = require('./server_configuration.json');
var reports_config = require('./reports_configuration.json');
var calibrations_config= require('./calibrations_configuration.json')
var sql = require('mssql');
var _und = require('underscore');
var Pusher = require('pusher');
var lzstring=require('./LZString.js')
var helper=require('./Helper.js')

var result={};		//para uso de respuestas hacia el solicitante

var pusher = new Pusher({
  appId: '326612',
  key: 'a0929f1d3b5ab10872cb',
  secret: '4dcdd397e7c735789a36',
  encrypted: true
});

// Se configura la variable app para que pueda usar bodyParser()
// Esto permite obtener data desde una peticion POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Bloque de configuracion para peticiones CORS
allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
};

app.use(allowCrossDomain);
//Fin del bloque de configuracion para peticiones CORS


var port = process.env.PORT || config.nodejsPort;    // Se establece el puerto

// Configuracion de rutas para el API
// =============================================================================
var router = express.Router();              // Establece la instancia del manejador de rutas de express

//Bloqueo de peticiones a la raiz del servicio 
router.get('/', function(req, res) {
    res.send('404: Page not Found', 404) 
});
router.post('/', function(req, res) {
    res.send('404: Page not Found', 404) 
});

/*Obtienes las divisiones registradas*/
router.route('/getDivisions')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var req = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			req.execute("sp_GetDivision",function(err, rs, returnValue){
				if (err){
					res.send(err);
					return;
				}else{
					//console.log(rs.length)
					res.send(rs.length>0?rs[0]:[])
				}
			});
		});
    })

/*Registro de una division*/
router.route('/setDivision')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('nombre', sql.VarChar(200), req.body.data.name)
		    request.input('descripcion', sql.VarChar(1000), req.body.data.description)
		    request.execute('sp_SetDivision').then(function(recordsets) {
		    	//console.log('length',recordsets.length);
		        //console.log(JSON.stringify(recordsets[0]).split(':')[1].replace('}]',''));
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":-1,
	        				"code":500,
	        				"error":'Error en la ejecucion del procedimiento sp_SetDivision',
	        				"message":'',
	        				"title":'Registro de divisiones'
	        	}		        
		        if (recordsets.length>0){
		        	result={
		        				"nombre":req.body.data.name,
		        				"descripcion":req.body.data.description,
		        				"id":parseInt(JSON.stringify(recordsets[0]).split(':')[1].replace('}]','')),
		        				"code":200,
		        				"error":'',
		        				"message":'Registro Procesado Exitosamente!!',
		        				"title":'Registro de divisiones'
		        	}
		        }
		        res.send(result);
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Registro de divisiones'
	        	}		        
		        res.send(err);
		    });			
		});
    })

/*Actualizacion de una division*/
router.route('/updateDivision')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}

			request.input('IdDivision', sql.Int, parseInt(req.body.data.id))
		    request.input('Nombre', sql.VarChar(200), req.body.data.name)
		    request.input('Descripcion', sql.VarChar(1000), req.body.data.description)
		    request.execute('sp_UpdateDivision').then(function(recordsets) {
        
		        if (recordsets.length==0){
		        	result={
		        				"nombre":req.body.data.name,
		        				"descripcion":req.body.data.description,
		        				"id":parseInt(req.body.data.id),
		        				"code":200,
		        				"error":'',
		        				"message":'Registro Procesado Exitosamente!!',
	        					"title":'Actualiazcion de divisiones'
		        	}
		        }
		        res.send(result);
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":parseInt(req.body.data.id),
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Actualiazcion de divisiones'
	        	}			        
		        res.send(result);
		    });			
		});
    })

/*Obtienes las categorias registradas sin vinculacion con sucursales*/
router.route('/getCategories')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var req = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			req.execute("CspGetCategories",function(err, rs, returnValue){
				if (err){
					res.send(err);
					return;
				}else{
					res.send(rs.length>0?rs[0]:[])
				}
			});
		});
    })

/*Obtienes los estandares vinculados y no vinculados a los formatos y divisiones con sus respectivos pesos*/
router.route('/getDivisionCategoriesStandars')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var req = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			req.execute("CspGetDivisionsCategoriesStandars",function(err, rs, returnValue){
				if (err){
					res.send(err);
					return;
				}else{
					res.send(rs.length>0?rs:[])
				}
			});
		});
    }) 

/*Obtienes las divisiones vinculadas y no vinculadas a los formatos con sus respectivos pesos*/
router.route('/getDivisionCategories')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var req = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			req.execute("CspGetDivisionsCategories",function(err, rs, returnValue){
				if (err){
					res.send(err);
					return;
				}else{
					res.send(rs.length>0?rs:[])
				}
			});
		});
    })    

/*Registro de una categoria*/
router.route('/setCategory')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('division', sql.Int, req.body.data.divisionId)
		    request.input('nombre', sql.VarChar(2000), req.body.data.name)
		    request.input('descripcion', sql.VarChar(2000), req.body.data.description)
		    request.execute('sp_SetCategoria').then(function(recordsets) {
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":-1,
	        				"code":500,
	        				"error":'Error en la ejecucion del procedimiento sp_SetDivision',
	        				"message":'',
	        				"title":'Registro de categorias'
	        	}		        
		        if (recordsets.length>0){
		        	result={
		        				"nombre":req.body.data.name,
		        				"descripcion":req.body.data.description,
		        				"id":parseInt(JSON.stringify(recordsets[0]).split(':')[1].replace('}]','')),
		        				"code":200,
		        				"error":'',
		        				"message":'Registro Procesado Exitosamente!!',
		        				"title":'Registro de categorias'
		        	}
		        }
		        res.send(result);
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Registro de categorias'
	        	}		        
		        res.send(err);
		    });			
		});
    })      

/*Actualizacion de una categoria*/
router.route('/updateCategory')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			request.input('IdCategoria', sql.Int, parseInt(req.body.data.id))
		    request.input('Nombre', sql.VarChar(250), req.body.data.name)
		    request.input('Descripcion', sql.VarChar(1000), req.body.data.description)
		    request.input('IdDivision', sql.Int, req.body.data.divisionId)

		    request.execute('sp_UpdateCategoria').then(function(recordsets) {
	        
		        if (recordsets.length==0){
		        	result={
		        				"nombre":req.body.data.name,
		        				"descripcion":req.body.data.description,
		        				"id":parseInt(req.body.data.id),
		        				"code":200,
		        				"error":'',
		        				"message":'Registro Procesado Exitosamente!!',
	        					"title":'Actualizacion de categoria'
		        	}
		        }
		        res.send(result);
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"nombre":req.body.data.name,
	        				"descripcion":req.body.data.description,
	        				"id":parseInt(req.body.data.id),
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Actualizacion de divisiones'
	        	}			        
		        res.send(result);
		    });			
		});
    })    


/*Guarda el peso del formato */
router.route('/saveFormatDivisionWeight')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				result=(err);
				return result;
			}

		    request.input('jsonData', sql.VarChar(sql.MAX), req.body.data)
		    request.execute('CspUpdateRegisterFormatoDivision').then(function(recordsets) {
		    	console.log(recordsets)
	        	result={
	        				"id":-1,
	        				"code":200,
	        				"error":'',
	        				"message":'Registros procesados Exitosamente',
	        				"title":'Guardado de formato division'
	        	}	
				/*
				pusher.trigger('calibrationChannel', 'onCalibrationSaved', {
				  "message": "Registros procesados Exitosamente",
				  "title":"Guardado de calibracion",
				  "timeOut":9000
				});	 */       	    	
				
				res.send(result);
	    		//res.send(recordsets.length>0?recordsets[0]:[])
	    		
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Guardado de formato division'
	        	}		        
		        res.send(result);
		    });						
		})		
    })   

/*Guarda el peso del estandar */
router.route('/saveFormatDivisionStandarWeight')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				result=(err);
				return result;
			}

		    request.input('jsonData', sql.VarChar(sql.MAX), lzstring.decompressFromBase64(req.body.data))
		    request.execute('CspUpdateRegisterFormatoDivisionStandarFromJSON').then(function(recordsets) {
		    	console.log(recordsets)
	        	result={
	        				"id":-1,
	        				"code":200,
	        				"error":'',
	        				"message":'Registros procesados Exitosamente',
	        				"title":'Guardado de formato division estandar'
	        	}	
				/*
				pusher.trigger('calibrationChannel', 'onCalibrationSaved', {
				  "message": "Registros procesados Exitosamente",
				  "title":"Guardado de calibracion",
				  "timeOut":9000
				});	 */       	    	
				
				res.send(result);
	    		//res.send(recordsets.length>0?recordsets[0]:[])
	    		
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Guardado de formato division estandar'
	        	}		        
		        res.send(result);
		    });						
		})		
    }) 

/*Obtienes los estandares registradas*/
router.route('/getStandars')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('flag', sql.Int, 4)
		    request.input('id', sql.Int, 0)
		    request.input('control',sql.VarChar(250),'0')
		    request.execute('sp_GetEstandar').then(function(recordsets) {
		    	//console.log('length',recordsets.length);
		        //console.log(JSON.stringify(recordsets[0]).split(':')[1].replace('}]',''));
	        	res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Mantenimiento de Estandares'
	        	}		        
		        res.send(err);
		    });			
		});
    })       

/*Obtiene los formatos registradas*/
router.route('/getFormats')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('idsucursal', sql.Int, -1)
		    request.execute('sp_GetFormato').then(function(recordsets) {
		    	//console.log('length',recordsets.length);
		        //console.log(JSON.stringify(recordsets[0]).split(':')[1].replace('}]',''));
	        	res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Mantenimiento de Formatos'
	        	}		        
		        res.send(err);
		    });			
		});
    })       

/*Obtiene los parametros para configurar la vista de parametros de calibraciones */
router.route('/getCalibrationParameters')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('type', sql.Int, parseInt(req.body.type))
		    request.execute('CspGetCalibrationParameters').then(function(recordsets) {
		        result=[];
		        
		        if (recordsets.length>0){
					result={
							monthListVisible:calibrations_config.monthListVisible,
							yearListVisible:calibrations_config.yearListVisible,
							dealerListVisible:calibrations_config.dealerListVisible,
							calibrationTypeListVisible:calibrations_config.calibrationTypeListVisible,
							monthListValues:calibrations_config.monthListValues,
							yearListValues:recordsets[1],
							dealerListValues:recordsets[0],
							calibrationTypeListValues:calibrations_config.calibrationTypeListValues
						}
		        }
				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de calibraciones'
	        	}		        
		        res.send(err);
		    });			
		});
    })   

/*Guarda los datos de sucursales formatos */
router.route('/updateSucursalesFormatos')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);

		//res.send('respuesta con el paquete')
/*console.log(lzstring.decompressFromBase64(req.body.dataAutoCalibracion))
console.log('----------------------------------------------------------')
console.log(lzstring.decompressFromBase64(req.body.dataCalibracion))
*/
		cnn.connect(function(err){
			if (err){
				result=(err);
				return result;
			}

		    request.input('jsonDataAutoCalibracion', sql.VarChar(sql.MAX), lzstring.decompressFromBase64(req.body.dataAutoCalibracion))
		    request.input('jsonDataCalibracion', sql.VarChar(sql.MAX), lzstring.decompressFromBase64(req.body.dataCalibracion))
		    request.execute('CspUpdateSucursalFormatoJSON').then(function(recordsets) {
		    	console.log(recordsets)
	        	result={
	        				"id":-1,
	        				"code":200,
	        				"error":'',
	        				"message":'Registros procesados Exitosamente',
	        				"title":'Guardado de Sucursales Formatos'
	        	}	
   	
				
				res.send(result);
	    		
		    }).catch(function(err) {
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Guardado de Sucursales Formatos'
	        	}		        
		        res.send(result);
		    });						
		})
    })   


/*Guarda la calibracion */
router.route('/saveCalibration')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		//console.log(req.body.data)
		//res.send('respuesta con el paquete')
		var dataList=req.body.data;

		cnn.connect(function(err){
			if (err){
				result=(err);
				return result;
			}

		    request.input('jsonData', sql.VarChar(sql.MAX), req.body.data)
		    request.execute('CspSetCalibracionRegistroFromJSON').then(function(recordsets) {
		    	console.log(recordsets)
	        	result={
	        				"id":-1,
	        				"code":200,
	        				"error":'',
	        				"message":'Registros procesados Exitosamente',
	        				"title":'Guardado de calibracion'
	        	}	
				/*
				pusher.trigger('calibrationChannel', 'onCalibrationSaved', {
				  "message": "Registros procesados Exitosamente",
				  "title":"Guardado de calibracion",
				  "timeOut":9000
				});	 */       	    	
				
				res.send(result);
	    		//res.send(recordsets.length>0?recordsets[0]:[])
	    		
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Guardado de calibracion'
	        	}		        
		        res.send(result);
		    });						
		})		
    })   

/*Finalizacion de la calibracion */
router.route('/closeCalibration')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('status', sql.Int, parseInt(req.body.status))
		    request.input('format', sql.Int, parseInt(req.body.format))
		    request.input('dealerId', sql.VarChar(100), req.body.dealerId)
		    request.input('calibrationMonth', sql.VarChar(100), req.body.calibrationMonth)
		    request.input('calibrationYear', sql.Int, parseInt(req.body.calibrationYear))
		    request.input('calibrationType', sql.Int, parseInt(req.body.calibrationType))

		    request.execute('CspUpdateCalibrationStatus').then(function(recordsets) {
	        	result={
	        				"id":-1,
	        				"code":200,
	        				"error":'',
	        				"message":req.body.status==1?'Calibracion Finalizada Exitosamente':'Calibracion Abierta Exitosamente',
	        				"title":'Finalizacion de calibracion'
	        	}	
				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Guardado de calibracion'
	        	}		        
		        res.send(err);
		    });			
		});
    })       

/*Obtiene los datos para armar la minuta */
router.route('/getMinutaResumen')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
			request.input('Mes', sql.Int, parseInt(req.body.month))
			request.input('Año', sql.Int, parseInt(req.body.year))
			request.input('Sucursal', sql.Int, parseInt(req.body.dealerId))
		    request.input('Tipo', sql.Int, parseInt(req.body.type))
		    request.input('Formato', sql.Int, parseInt(req.body.format))
		    request.execute('CspGetMinutaResumen').then(function(recordsets) {
		        result={};
		        
		        if (recordsets.length>0){
					result={
							conclusionCablibracion:recordsets[0],
							sucursalCorreo:recordsets[1],
							minutaResumen:recordsets[2]
						}
		        }
				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Minutas'
	        	}		        
		        res.send(err);
		    });			
		});
    }) 

/*Obtiene las sucursales registradas*/
router.route('/getDealers')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('Activo', sql.Int, 1)
		    request.execute('sp_GetSucursal').then(function(recordsets) {
		    	//console.log('length',recordsets.length);
		        //console.log(JSON.stringify(recordsets[0]).split(':')[1].replace('}]',''));
	        	res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Mantenimiento de Sucursales'
	        	}		        
		        res.send(err);
		    });			
		});
    })

/*Obtiene informacion para la calibracion*/ 
router.route('/getCalibracions')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn); 

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body); 			

			request.input('ID_Sucursal', sql.Int, req.body.sucursalId)
			request.input('Mes', sql.VarChar(50), req.body.mes)
			request.input('Year', sql.VarChar(50), req.body.year)
			request.input('TipoCalibracion', sql.Int, req.body.tipo)
			request.input('Formato', sql.Int, req.body.formatoId)

			//request.execute('sp_GetRegistroEstandarBySucursal_Mes').then(function(recordsets) {
			request.execute('CspGetRegistroEstandarBySucursal_Mes').then(function(recordsets) { 				
	        	res.send(recordsets.length>0?recordsets:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Calibracion'
	        	}		        
		        res.send(err);
		    });
		});
    })
/*Fin calibracion*/

/*Obtiene informacion estandares por sucursal*/
router.route('/getFormatoSucursal')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var req = new sql.Request(cnn);

		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			req.execute("CspGetFormatos",function(err, rs, returnValue){
				if (err){
					res.send(err);
					return;
				}else{
					//console.log(rs.length)
					res.send(rs.length>0?rs[0]:[])
				}
			});
		});
    })

/*Obtiene los usuarios registradas*/
router.route('/getUsers')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.execute('sp_GetUsuarios').then(function(recordsets) {
		    	//console.log('length',recordsets.length);
		        //console.log(JSON.stringify(recordsets[0]).split(':')[1].replace('}]',''));
	        	res.send(recordsets.length>0?recordsets:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":'',
	        				"title":'Mantenimiento de Usuarios'
	        	}		        
		        res.send(err);
		    });			
		});
    })     

/*Obtiene los registros del Reporte de Planes de accion abiertos del dealer que lo solicita*/
router.route('/getReportePlanesAccion')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('idsucursal', sql.Int, req.body.dealerId)
		    request.input('Tipocalibracion', sql.Int, req.body.calibrationType)
		    request.input('Mes', sql.Int, req.body.month)
		    request.input('ano', sql.Int, req.body.year)
		    request.execute('sp_ReportePlanesAccion').then(function(recordsets) {
		        result={};
		        var structure=[];
		        if (recordsets.length>0){
		        	structure=helper.getReportPlanesAccionStructure();
		        }
		        result ={
		        			structure:structure,
		        			data:recordsets[0]
		        }

				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de reportes'
	        	}		        
		        res.send(err);
		    });			
		});
    }) 

/*Obtiene los registros del Reporte de Cumplimiento Global*/
router.route('/getReporteCumplimientoGlobal')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('mes', sql.VarChar(10), req.body.month)
		    request.input('year', sql.VarChar(10), req.body.year)
		    request.input('idsucursal', sql.Int, req.body.dealerId)
		    
		    request.execute('CspReporteCumplimientoGlobal').then(function(recordsets) {
		        result={};
		        var structure=[];
		        var data=[];
		        var flag=false;
		        var ok1=false;
		        var ok2=false;

		        if (recordsets.length>0){
		        	recordsets[1].forEach(function(item, index){
		        		/* Se realiza el armado de los dealers asociados */
		        		data.forEach(function(itemD, indexD){
		        			if (item.nombre.toString()==itemD.name.toString()){
		        				flag=true;
		        			}
		        		})

		        		if (!flag)	{
		        			data.push({	name: item.nombre.toString(),
		        						months:[]
		        						})	

		        		}

						flag=false
						/* FIN del armado de los dealers asociados */
		        	})
		        	/* Se realiza el armado de la estructura en formato json para armara la tabla de datos */
        			structure.push({	name: 'Sucursal',
        								months:helper.getDealerReporteCumplimientoGlobalStructure(recordsets[0])
        						})
        			/* FIN del armado de la estructura en formato json para armara la tabla de datos */

        			/* Se termina de ensamblar el paquete de datos en formato json para armara la tabla de datos */
					data.forEach(function(item, index){
						item.months=helper.getDealerReporteCumplimientoGlobalData(item.name, recordsets[0])

						item.months.forEach(function(itemM, indexM){
							for (var i = recordsets[1].length - 1; i >= 0; i--) {
								if (recordsets[1][i].nombre==itemM.dealer &&
									recordsets[1][i].mescalibracion==getMonthNumber(itemM.name)){

									if (itemM.calibrationTypes[0].name==recordsets[1][i].tipo &&
										itemM.calibrationTypes[0].name=='Calibración'){

										itemM.calibrationTypes[0].value=parseFloat(recordsets[1][i].Cumplimiento)
									}

									if (itemM.calibrationTypes[1].name==recordsets[1][i].tipo &&
										itemM.calibrationTypes[1].name=='Autocalibración'){

										itemM.calibrationTypes[1].value=parseFloat(recordsets[1][i].Cumplimiento)

									}
								}
							}
						})

						for (var i = item.months.length - 1; i >= 0; i--) {
							ok1=isNaN(parseFloat(item.months[i].calibrationTypes[0].value))
							ok2=isNaN(parseFloat(item.months[i].calibrationTypes[1].value))

							if (ok1 && ok2){
								item.months.splice(i, 1);
							}

						}

					})
					
					/* FIN de ensamblar el paquete de datos en formato json para armara la tabla de datos */

		        }
		        result ={
		        			structure:structure,
		        			data:data
		        }

				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de reportes'
	        	}		        
		        res.send(err);
		    });			
		});
    }) 

/*Obtiene los registros del Reporte de Cumplimiento de Categoria del dealer que lo solicita*/
router.route('/getReporteCumplimientoCategoria')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('mes', sql.VarChar(10), req.body.month)
		    request.input('year', sql.VarChar(10), req.body.year)
		    request.input('idsucursal', sql.Int, req.body.dealerId)
		    
		    request.execute('CspReporteCumplimientoCategoria').then(function(recordsets) {
		        result={};
		        var structure=[];
		        var data=[];
		        var flag=false;

		        if (recordsets.length>0){
		        	recordsets[0].forEach(function(item, index){
		        		/* Se realiza el armado de los dealers asociados */
		        		data.forEach(function(itemD, indexD){
		        			if (item.NOMBRE.toString()==itemD.name.toString()){
		        				flag=true;
		        			}
		        		})

		        		if (!flag)	{
		        			data.push({	name: item.NOMBRE.toString(),
		        							calibrationTypes:[
		        												{
			        												type:'AutoCalibracion',
			        												categories:[]
			        											},
																{
			        												type:'Calibracion',
			        												categories:[]
			        											}
		        											]
		        						})	

		        		}

						flag=false
						/* FIN del armado de los dealers asociados */
		        	})
		        	/* Se realiza el armado de la estructura en formato json para armara la tabla de datos */
        			structure.push({	name: 'Sucursal',
        							calibrationTypes:[
        												{
	        												type:'AutoCalibracion',
	        												categories:[]
	        											},
														{
	        												type:'Calibracion',
	        												categories:[]
	        											}
        											]
        						})	
        			structure.forEach(function(item, index){
						item.calibrationTypes.forEach(function(itemC, indexC){
							if (itemC.type=='AutoCalibracion'){
								itemC.categories= helper.getDealerAutocalibracionStructure('Autocalibración',recordsets[0])
							}
							if (itemC.type=='Calibracion'){
								itemC.categories= helper.getDealerAutocalibracionStructure('Calibración',recordsets[0])
							}							
						})        				
        			})
        			/* FIN del armado de la estructura en formato json para armara la tabla de datos */

        			/* Se termina de ensamblar el paquete de datos en formato json para armara la tabla de datos */
					data.forEach(function(item, index){
						item.calibrationTypes.forEach(function(itemC, indexC){
							if (itemC.type=='AutoCalibracion'){
								itemC.categories= helper.getDealerAutocalibracionValues(item.name,'Autocalibración',recordsets[0])
							}
							if (itemC.type=='Calibracion'){
								itemC.categories= helper.getDealerAutocalibracionValues(item.name,'Calibración',recordsets[0])
							}							
						})
					})
					/* FIN de ensamblar el paquete de datos en formato json para armara la tabla de datos */

		        }
		        result ={
		        			structure:structure,
		        			data:data
		        }

				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de reportes'
	        	}		        
		        res.send(err);
		    });			
		});
    }) 

router.route('/login')
	.post(function(req,res){	
		console.log('parametros',req.body.username,req.body.userpassword)
		    if (req.body.username.toString().toLowerCase()=='administrador' &&
		    		req.body.userpassword=='123456'){
			        	result={
			        				"id":0,
			        				"code":200,
			        				"error":'',
			        				"message":'',
			        				"title":'Inicio de sesion'
			        	}		    	
		    		}else{
			        	result={
			        				"id":0,
			        				"code":500,
			        				"error":'Error en autenticacion',
			        				"message":'Credenciales no validas',
			        				"title":'Inicio de sesion'
			        	}		    			
		    		}
		    res.send(result)
	})

/*Obtiene la data y estructura para correspondiente a los formatos por sucursal*/
router.route('/getSucursalesFormatos')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}

		    request.execute('CspGetSucursalesFormatos').then(function(recordsets) {
		        result={};
		        var structure=[];
		        if (recordsets.length>0){
					structure.push( {
								        "name": "dealer",
								        "width": 300,
								        "displayName": "Sucursal",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    })
					recordsets[0].forEach(function(item, index){
						structure.push( {
									        "name": item.Nombre.toString(),
									        "width": 100,
									        "displayName": item.Nombre.toString(),
									        "enableCellEdit": false,
									        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
									    })						
					})
		        }
		        result ={
		        			structure:structure,
		        			dataAutoCalibracion:recordsets[2],
		        			dataCalibracion:recordsets[3],
		        			dataWithId:recordsets[1]
		        }

				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Sucursales Formatos'
	        	}		        
		        res.send(err);
		    });			
		});
    })//Fin de funcion POST


/*Obtiene los registros del Reporte de Cumplimiento de Cronograma del dealer que lo solicita*/
router.route('/getReporteCumplimientoCronograma')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}

		    request.input('idsucursal', sql.Int, req.body.dealerId)
		    request.input('Year', sql.Int, req.body.year)
		    request.execute('CspReporteCumplimientoCronograma').then(function(recordsets) {
		        result={};
		        var structure=[];
		        if (recordsets.length>0){
					structure.push( {
								        "name": "dealer",
								        "width": 300,
								        "displayName": "Sucursal",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    })
					recordsets[0].forEach(function(item, index){
						structure.push( {
									        "name": item.Mes.toString(),
									        "width": 100,
									        "displayName": item.Mes.toString(),
									        "enableCellEdit": false,
									        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
									    })						
					})
		        }
		        result ={
		        			structure:structure,
		        			data:recordsets[1]
		        }

				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de reportes'
	        	}		        
		        res.send(err);
		    });			
		});
    }) 


/*Obtiene los parametros para configurar la vista de parametros de reportes segun el usuario que lo solicita*/
router.route('/getReportParameters')
    .post(function(req, res) {
		var cnn = new sql.Connection(config);
		var request = new sql.Request(cnn);
		cnn.connect(function(err){
			if (err){
				res.send(err);
				return;
			}
			//console.log(req.body)
		    request.input('userId', sql.Int, req.body.userId)
		    request.execute('CspGetReportParameters').then(function(recordsets) {
		        result=[];
		        var configReport=helper.getReportParametersConfig(req.body.reportType);
		        if (recordsets.length>0){
					result={
							monthListVisible:configReport.monthListVisible,
							yearListVisible:configReport.yearListVisible,
							dealerListVisible:configReport.dealerListVisible,
							calibrationTypeListVisible:configReport.calibrationTypeListVisible,
							monthListValues:reports_config.monthListValues,
							yearListValues:recordsets[1],//reports_config.yearListValues,
							dealerListValues:recordsets[0],
							calibrationTypeListValues:reports_config.calibrationTypeListValues
						}
		        }
				res.send(result);
        		//res.send(recordsets.length>0?recordsets[0]:[])
		    }).catch(function(err) {
		        // ... execute error checks 
		        //Se realiza la captura del error en la bbdd
		        //Se realiza la captura del error en un archivo plano
		        console.log(err)
	        	result={
	        				"id":-1,
	        				"code":500,
	        				"error":err.message,
	        				"message":err.message,
	        				"title":'Parametros de reportes'
	        	}		        
		        res.send(err);
		    });			
		});
    })   


// Registro de rutas del API
// Todas las rutas tienen como path principal /api
app.use('/api', router);

// Inicio del servidor
// =============================================================================
app.listen(process.env.PORT);
console.log('Servicio conexion a sql server corriendo en el puerto:' + port);
console.log(lzstring.compressToBase64('hola')) 
console.log(lzstring.decompressFromBase64(lzstring.compressToBase64('hola')))