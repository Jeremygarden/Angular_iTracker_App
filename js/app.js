var lineRouteQuery = {
	"Red Line" : "route=Red",
	"Orange Line" : "route=Orange",
	"Blue Line" : "route=Blue",
	"Green Line-B": "route=Green-B",
	"Green Line-C": "route=Green-C",
	"Green Line-D": "route=Green-D",
	"Green Line-E": "route=Green-E"
};



(function() {

	var app = angular.module('iTracker', ['angular-loading-bar', 'ui.bootstrap']);

	app.controller('subwayController', ['$http', '$scope', function($http, $scope) {
		var subctrl = this;
		subctrl.timeByStop = [];
		subctrl.stopOrange = [];
		subctrl.stopRed = [];
		subctrl.stopRedS1 = [];
		subctrl.stopRedS2 = [];
		subctrl.stopBlue = [];
		subctrl.stopCurrent = [];
		subctrl.stop = "";
		subctrl.stopID = "";
		subctrl.lineCurrent ="";
		subctrl.directions = [];
		subctrl.currentTime = "";
		subctrl.errorInfo="";
		subctrl.directionListClass = "";
		subctrl.stopGroupClass = "";
		subctrl.alertInformation = [];
		subctrl.alert="";

		// Get all ORANGE stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=8VySMttd60SVAJLHvnYxLw&route=Orange&format=json').success(function(data) {
			var stops = data.direction[0].stop;

			for (i = 0; i < stops.length; i++) {
				var _stop = {}
				_stop.stop_id = stops[i].parent_station;
				_stop.stop_name = stops[i].parent_station_name;
				subctrl.stopOrange.push(_stop);
			}
		});

		// Get all BLUE stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=8VySMttd60SVAJLHvnYxLw&route=Blue&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 0; i < stops.length; i++) {
				var _stop = {}
				_stop.stop_id = stops[i].parent_station;
				_stop.stop_name = stops[i].parent_station_name;
				subctrl.stopBlue.push(_stop);
			}
		});

		// Get all RED stops and set the matching array for it.
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=8VySMttd60SVAJLHvnYxLw&route=Red&format=json').success(function(data) {
			var stops = data.direction[0].stop;

			//Southbound to North at JFK (the 13th stop)stop would get a binary route
			for (i = 0; i < 13; i++) {
				var _stop = {}
				_stop.stop_id = stops[i].parent_station;
				_stop.stop_name = stops[i].parent_station_name;
				subctrl.stopRed.push(_stop);
			}
		});
		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=8VySMttd60SVAJLHvnYxLw&route=Red&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 13; i < 17; i++) {
				var _stop = {}
				_stop.stop_id = stops[i].parent_station;
				_stop.stop_name = stops[i].parent_station_name;
				subctrl.stopRedS1.push(_stop);
			}
		});

		$http.get('http://realtime.mbta.com/developer/api/v2/stopsbyroute?api_key=8VySMttd60SVAJLHvnYxLw&route=Red&format=json').success(function(data) {
			var stops = data.direction[0].stop;
			for (i = 17; i < stops.length; i++) {
				var _stop = {}
				_stop.stop_id = stops[i].parent_station;
				_stop.stop_name = stops[i].parent_station_name;
				subctrl.stopRedS2.push(_stop);
			}
		});


		subctrl.setLine = function(activeLine) {
			subctrl.errorInfo = "";
			subctrl.stopGroupClass = "";
			switch(activeLine) {
				case 1:
					subctrl.stopCurrent = subctrl.stopOrange;
					subctrl.lineCurrent = "Orange Line";
					subctrl.stopGroupClass = "stopGroupOrange";
					break;
				case 2:
					subctrl.stopCurrent = subctrl.stopRed.concat(subctrl.stopRedS1).concat(subctrl.stopRedS2);
					subctrl.lineCurrent = "Red Line";
					subctrl.stopGroupClass = "stopGroupRed";
					break;
				case 3:
					subctrl.stopCurrent = subctrl.stopBlue;
					subctrl.lineCurrent = "Blue Line";
					subctrl.stopGroupClass = "stopGroupBlue";
					break;
				default:
					subctrl.stopCurrent = [];
			}
		}

		//filter lines by current active
		subctrl.filterLine = function(routes) {
			var result = [];

			result = routes.filter(function(obj) {
				return obj.route_name == subctrl.lineCurrent;
			});
			return result;
		}



		//groupby stop to color
		subctrl.addStopColor = function() {

			var stopClass = "";
			subctrl.directionListClass = "";
			switch(subctrl.lineCurrent) {

				default:
					stopClass="";
				case "Blue Line":
					stopClass="stopBlue";
					subctrl.directionListClass = "directionListBlue";
					break;
				case "Orange Line":
					stopClass="stopOrange";
					subctrl.directionListClass = "directionListOrange";
					break;
				case "Red Line":
					stopClass="stopRed";
					subctrl.directionListClass = "directionListRed";
					break;


			}
			$(".stopName").removeClass('stopOrange stopRed stopBlue');
			$(".stopName").addClass(stopClass);
			$(".stopBlock .time").addClass("currentTime");

		}
		//Time format conversion
		subctrl.convertTime = function(time) {
			var minutes = Math.floor(time/60);
			var seconds = time - minutes * 60;
			var seconds2 = ("0" + seconds).slice(-2);
			if (minutes == 0) {
				if (seconds < 10) {
					return seconds + "s";
				} else {
					return seconds2 + "s";
				}
			} else {
				return minutes + "m " + seconds2 + "s";
			}
		}

		//reset state
		subctrl.reset = function() {
			subctrl.timeByStop = [];
			subctrl.stop = "";
			subctrl.directions = [];
			subctrl.currentTime = "";
			subctrl.directionListClass = "";
			subctrl.stopGroupClass = "";
			subctrl.alertInformation = [];
			subctrl.alert="";
			$(".stopName").removeClass('stopOrange stopRed stopBlue');
			$(".stopBlock .time").removeClass("currentTime");
		}

		subctrl.getStopID = function(stopname) {
			var result = subctrl.stopCurrent.filter(function(obj) {
				return obj.stop_name == stopname;
			});
			subctrl.stopID = result[0].stop_id;
			return subctrl.stopID;
		}

		//Get Prediction Time
		subctrl.getTimeByStop = function(stopid) {
			subctrl.errorInfo = "";
			$http.get('http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=8VySMttd60SVAJLHvnYxLw&stop=' + stopid + '&format=json').success(function(data) {
				subctrl.timeByStop = subctrl.filterLine(data.mode[0].route);
				
				console.log("timeBystop!!!!");
				console.log(data.mode[0].route);
				subctrl.stop = data.stop_name;
				if (subctrl.timeByStop.length == 0) {
					subctrl.errorInfo = "Sorry, currently we can't get any info from MBTA. Please try again later.";
				} else {
					subctrl.directions = [{}, {}];
					subctrl.directions[0].trips = [];
					subctrl.directions[0].direction = subctrl.timeByStop[0].direction[0].direction_name;
					
					if (subctrl.timeByStop[0].direction.length > 1) {
						subctrl.directions[1].trips = [];
						subctrl.directions[1].direction = subctrl.timeByStop[0].direction[1].direction_name;
					}

					//For Red Line, conbine two routes
					if (subctrl.timeByStop.length > 1) {
						for (i = 0; i < subctrl.timeByStop.length; i++) {
							if (subctrl.directions[1].direction == "") {
								subctrl.directions[1].direction = subctrl.timeByStop[1].direction[1].direction_name;
							}

							var south = subctrl.timeByStop[i].direction[0].trip;
							subctrl.directions[0].trips = subctrl.directions[0].trips.concat(Southbound);
							if (subctrl.timeByStop[i].direction.length > 1) {
								var northbound = subctrl.timeByStop[i].direction[1].trip;
								subctrl.directions[1].trips = subctrl.directions[1].trips.concat(northbound);
							}
						}
						
					} 
					else {
						subctrl.directions[0].trips = subctrl.timeByStop[0].direction[0].trip;
						if (subctrl.timeByStop[0].direction.length > 1) {
							subctrl.directions[1].trips = subctrl.timeByStop[0].direction[1].trip;
						}
					}
					subctrl.directions[0].trips.sort(function(a, b) {
						return a.pre_away - b.pre_away;
					});
					subctrl.directions[1].trips.sort(function(a, b) {
						return a.pre_away - b.pre_away;
					});
			
					subctrl.currentTime = Date.now();
					subctrl.addStopColor();
				}

				
			}).error(function() {
				subctrl.reset();
				subctrl.errorInfo = "Sorry, Something goes wrong. Please try it again."
			});
		}

		
		
	}]);
})();