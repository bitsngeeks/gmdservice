var Helper = (function() {

var Helper={

	getReportParametersConfig:function(type){
		var result={}

		switch(type){
	    case 'planAccion':
	        result={
							monthListVisible:true,
							yearListVisible:true,
							dealerListVisible:true,
							calibrationTypeListVisible:true        	
	        }
	        break;
	    case 'cumplimientoGlobal':
	        result={
							monthListVisible:true,
							yearListVisible:true,
							dealerListVisible:true,
							calibrationTypeListVisible:false        	
	        }
	        break;
	    case 'cumplimientoCategoria':
	        result={
							monthListVisible:true,
							yearListVisible:true,
							dealerListVisible:true,
							calibrationTypeListVisible:false        	
	        }
	        break;
	    case 'cumplimientoCarga':
	        result={
							monthListVisible:false,
							yearListVisible:true,
							dealerListVisible:false,
							calibrationTypeListVisible:false
	        }
	        break;                        		
		}
		return result;
	},

	getMonthName:function(monthNumber){
		var result=''
		switch(monthNumber){
			case 1:
				result='Enero'
				break;
			case 2:
				result='Febrero'
				break;
			case 3:
				result='Marzo'
				break;
			case 4:
				result='Abril'
				break;
			case 5:
				result='Mayo'
				break;
			case 6:
				result='Junio'
				break;
			case 7:
				result='Julio'
				break;
			case 8:
				result='Agosto'
				break;	
			case 9:
				result='Septiembre'
				break;
			case 10:
				result='Octubre'
				break;	
			case 11:
				result='Noviembre'
				break;
			case 12:
				result='Diciembre'
				break;			
		}

		return result;												
	},

	getMonthNumber:function(monthName){
		var result=''
		switch(monthName){
			case 'Enero':
				result=1
				break;
			case 'Febrero':
				result=2
				break;
			case 'Marzo':
				result=3
				break;
			case 'Abril':
				result=4
				break;
			case 'Mayo':
				result=5
				break;
			case 'Junio':
				result=6
				break;
			case 'Julio':
				result=7
				break;
			case 'Agosto':
				result=8
				break;	
			case 'Septiembre':
				result=9
				break;
			case 'Octubre':
				result=10
				break;	
			case 'Noviembre':
				result=11
				break;
			case 'Diciembre':
				result=12
				break;			
		}

		return result;												
	},

	getReportPlanesAccionStructure:function(){
		var result=[
									{
								        "name": "Concesionario",
								        "width": 300,
								        "displayName": "Concesionario",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "Puntaje",
								        "width": 150,
								        "displayName": "Puntaje",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },								    
									{
								        "name": "Estandar",
								        "width": 100,
								        "displayName": "Estandar",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "Observaciones",
								        "width": 300,
								        "displayName": "Observaciones",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "planaccion",
								        "width": 300,
								        "displayName": "Plan de accion",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "comentarios",
								        "width": 300,
								        "displayName": "Comentarios Plan Accion",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "responsable",
								        "width": 150,
								        "displayName": "Responsable",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{
								        "name": "fechacompromiso",
								        "width": 180,
								        "displayName": "Fecha Compromiso",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{	
								        "name": "MesCalibracion",
								        "width": 150,
								        "displayName": "Mes Calibracion",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{	
								        "name": "AñoCalibracion",
								        "width": 150,
								        "displayName": "Año Calibracion",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{	
								        "name": "fecharegistro",
								        "width": 200,
								        "displayName": "Fecha Registro",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    },
									{	
								        "name": "EstatusPA",
								        "width": 200,
								        "displayName": "Estatus Plan de Accion",
								        "enableCellEdit": false,
								        "cellTemplate": "<divclass=\"ui-grid-cell-contents\"><span>{{COL_FIELD}}</span></div>"
								    }];
		return result;
	},

	/*Obtiene la estructura para armar la tabla en la vista del Reporte de Cumplimiento de Categoria*/
	getDealerAutocalibracionStructure:function( type, data){
	    var result=[];	
	    var flag=false;
		data.forEach(function(item, index){
			if (item.TIPO==type ){
				for (var i = result.length - 1; i >= 0; i--) {
					flag=false
					if (result[i].value==item.FORMATO){
						flag=true;
						break;
					}
				}
				if (!flag){
						result.push({	id:item.FORMATO,
										value:item.FORMATO})		
				}
			}
		})	
		result.push({	id:'Total',
					value:'Total'})
		return result;
	},

	/*Obtiene la data para armar la tabla en la vista del Reporte de Cumplimiento de Categoria */
	getDealerAutocalibracionValues:function(dealer, type, data){
	    var result=[];
		data.forEach(function(item, index){
			if (
				item.TIPO==type &&
				item.NOMBRE== dealer){
				result.push({	id:item.FORMATO,
								value:item.PORCENTAJE})
			}
		})	

		if (result.length>0){
			result.push({	id:'Total',
						value:'Total'})		
		}

		return result;
	},

	getDealerReporteCumplimientoGlobalStructure:function(data){
	 	var result=[];	
	    var flag=false;
		data.forEach(function(item, index){
			for (var i = result.length - 1; i >= 0; i--) {
				flag=false
				if (parseInt(result[i].name)==parseInt(item.mescalibracion)){
					flag=true;
					break;
				}
			}
			if (!flag){
					result.push({	
									name:item.mescalibracion,
									calibrationTypes:[
														{name:'Calibración'},
														{name:'Autocalibración'}
														]
								})		
			}
		})	

		result.forEach(function(item,index){
			item.name=helper.getMonthName(item.name)
		})

		return result;
	},

	getDealerReporteCumplimientoGlobalData:function(dealer,data){
	 	var result=[];	
	    var flag=false;
		data.forEach(function(item, index){
			for (var i = result.length - 1; i >= 0; i--) {
				flag=false
				if (parseInt(result[i].name)==parseInt(item.mescalibracion) && 
					result[i].dealer== dealer){
					flag=true;
					break;
				}
			}
			if (!flag){
					result.push({	
									name:item.mescalibracion,
									dealer:dealer,
									calibrationTypes:[
														{name:'Calibración',value:''},
														{name:'Autocalibración',value:''}
														]
								})		
			}
		})	

		result.forEach(function(item,index){
			item.name=helper.getMonthName(item.name)
		})

		return result;
	}					

};

return Helper;

})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = Helper;
}
else {
	if (typeof define === 'function' && define.amd) {
  		define([], function() {
    	return Helper;
  		});
	}
	else {
  		window.Helper = Helper;
	}
}