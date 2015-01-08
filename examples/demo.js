var daikin = require("../");

var unit = new daikin.Unit();

unit.on("ModelInfo", function(e) {
	console.log("ModelInfo: " + JSON.stringify(e));
});
unit.on("RemoteMethod", function(e) {
	console.log("RemoteMethod: " + JSON.stringify(e));
});
unit.on("Notify", function(e) {
	console.log("Notify: " + JSON.stringify(e));
});
unit.on("BasicInfo", function(e) {
	console.log("BasicInfo: " + JSON.stringify(e));
});

unit.on("ControlInfo", function(e) {
	console.log("ControlInfo: " + JSON.stringify(e));
});
unit.on("SensorInfo", function(e) {
	console.log("SensorInfo: " + JSON.stringify(e));
});
unit.on("Error", function(e) {
	console.log("Error: " + JSON.stringify(e));
});

//console.log('Error:', result.message);

unit.getModelInfo();
unit.getRemoteMethod();
unit.getNotify();
unit.getBasicInfo();
unit.getSensorInfo();
unit.getControlInfo();

var controlInfo = {
		pow: daikin.Power.ON,
		mode: daikin.Mode.COLD,
		stemp: 19,
		shum: "AUTO",
		//f_rate: daikin.FanRate.SILENCE,
		f_rate: daikin.FanRate.LEVEL_2,
		f_dir: daikin.FanDirection.HORIZONTAL | daikin.FanDirection.VERTICAL,
	};
	
//unit.setControlInfo(controlInfo);
