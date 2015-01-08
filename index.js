var util = require('util');
var rest = require('restler');
var urlencode = require('urlencode');
var events =  require('events');

"use strict";

var config = {
	ip: "192.168.0.29"
}

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

/* ------------- Objects ----------------- */

var Power = {
	OFF: 0,
	ON:  1
};

var PowerReverse = {
	"0": Power.OFF,
	"1": Power.ON
};

var Mode = {
	AUTO:     0,
	AUTO1:    1,
	AUTO2:    7,
	DEHUMDID: 2,
	COLD:     3,
	HOT:      4,
	FAN:      6,
};

var ModeReverse = {
	"0": Mode.AUTO,
	"1": Mode.AUTO1,
	"7": Mode.AUTO2,
	"2": Mode.DEHUMDID,
	"3": Mode.COLD,
	"4": Mode.HOT,
	"6": Mode.FAN,
};

var FanRate = {
	AUTO:    "A",
	SILENCE: "B",
	LEVEL_1: 1,
	LEVEL_2: 2,
	LEVEL_3: 3,
	LEVEL_4: 4,
	LEVEL_5: 5
};

var FanRateReverse = {
	"A": FanRate.AUTO,	
	"B": FanRate.SILENCE,	
	"1": FanRate.LEVEL_1,	
	"2": FanRate.LEVEL_2,	
	"3": FanRate.LEVEL_3,	
	"4": FanRate.LEVEL_4,	
	"5": FanRate.LEVEL_5,
};

var FanDirection = {
	STOP:       0,
	VERTICAL:   1,
	HORIZONTAL: 2,
	VERT_HORIZ: 3
};

var FanDirectionReverse = {
	"0": FanDirection.STOP,
	"1": FanDirection.VERTICAL,
	"2": FanDirection.HORIZONTAL,
	"3": FanDirection.VERT_HORIZ,
}

var Status = {
	OK: "OK",
	PARAM_NG: "PARAM NG"
	// ...
}

var ErrorCode = {
	OK: 0,
}

var Type = {
	AC: "aircon"
	// ...
}

var Method = {
	POLLING: "polling",
}

var AdpMode = {
	RUN: "run"
}

var BasicParam = {
	ret: Status,
	type: Type,
	reg: String,	// "th"
	dst: Number,
	ver: String,	//version
	pow: Power,		// power
	err: Number,
	location: Number,
	name: String,
	icon: Number,
	method: Method,
	port: Number,
	id: String,		// unit identifier
	pw: String,		// password
	lpw_flag: Number,
	adp_kind: Number,
	pv: Number,
	cpv: Number,
	led: Number,	// status LED on or off
	en_setzone: Number,
	mac: String,
	adp_mode: AdpMode
}

var ControlParam = {
	pow: Power,
	mode: Mode,
	stemp: Number,
	shum: Number,		// "AUTO" or Number from 0..50
	f_rate: FanRate,
	f_dir: FanDirection,
	
	// the following are returned, but not set-able
	ret: Status,
	adv: null,			// ????
	
	dt1: Number,		// "M" or Number 10..41
	dt2: Number,
	dt3: Number,
	dt4: Number,
	dt5: Number,
	dt7: Number,
	
	dh1: String,		// AUTO or Number
	dh2: String,		// AUTO or Number
	dh3: String,		// AUTO or Number
	dh4: String,		// AUTO or Number
	dh5: String,		// AUTO or Number
	dh7: String,		// AUTO or Number
	dhh: String,		// AUTO or Number
	
	b_mode: Mode,
	b_stemp: Number,
	b_shum: Number,
	
	alert: Number		// 255
}

var SensorParam = {
	ret: Status,
	htemp: Number,
	hhum: Number,
	otemp: Number,
	err: Number,
	cmpfreq: Number
};


/**
 * An airconditioner unit controller
 */
var AcUnit = function() {
	events.EventEmitter.call(this);
	this.config = config;
};
util.inherits(AcUnit, events.EventEmitter);


AcUnit.prototype.getBasicInfo = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/common/basic_info")
		.on('complete', function(result) {
		  if (result instanceof Error) {
			self.emit("Error", result);
		  } else {
		    var pairs = result.split(',');
		    var info = {};
		    for (var i=0; i<pairs.length; i++) {
		    	var p = pairs[i];
			    var o = urlencode.parse(p);
			    extend(info, o);
		    }
		    self.emit("BasicInfo", info);
		  }
		});
};

AcUnit.prototype.getModelInfo = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/aircon/get_model_info")
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			self.emit("ModelInfo", info);
		}
	});
};

AcUnit.prototype.getControlInfo = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/aircon/get_control_info")
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			self.emit("ControlInfo", info);
		}
	});
};

/**
 * Set control data
 */
AcUnit.prototype.setControlInfo = function(info) {
	/* minimal: pow=1&mode=1&stemp=26&shum=0&f_rate=B&f_dir=3
	/* not set, but returned:
		adv
		dt*
		dh*
		dfr*
		dfd*
		b_mode
		b_stemp
		b_shum
		b_f_rate
		b_f_dir
		alert
	*/

	var self = this;
	
	var options = {
		data: info
	};
	
	rest.post("http://" + this.config.ip + "/aircon/set_control_info", options)
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			//console.log(result);
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			if (info.ret != Status.OK) {
				self.emit("Error", new Error(info));
			}
			else {
				//self.emit("ControlInfo", info);
				self.getControlInfo();
			}
		}
	});
	
};

AcUnit.prototype.getSensorInfo = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/aircon/get_sensor_info")
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			self.emit("SensorInfo", info);
		}
	});
};

AcUnit.prototype.getRemoteMethod = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/common/get_remote_method")
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			self.emit("RemoteMethod", info);
		}
	});
};

AcUnit.prototype.setRemoteMethod = function(method) {
};

AcUnit.prototype.getNotify = function() {
	var self = this;
	rest.get("http://" + this.config.ip + "/common/get_notify")
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			self.emit("Notify", info);
		}
	});
};


AcUnit.prototype.setLed = function(on) {
	var self = this;
	
	var options = {
		data: { led: on ? "1" : "0" }
	};
	
	rest.post("http://" + this.config.ip + "/common/set_led", options)
	.on('complete', function(result) {
		if (result instanceof Error) {
			self.emit("Error", result);
		}
		else {
			//console.log(result);
			var pairs = result.split(',');
			var info = {};
			for (var i=0; i<pairs.length; i++) {
				var p = pairs[i];
				var o = urlencode.parse(p);
				extend(info, o);
			}
			if (info.ret != Status.OK) {
				self.emit("Error", new Error(info));
			}
			else {
				//self.emit("ControlInfo", info);
				self.getControlInfo();
			}
		}
	});
}


/** exports */
module.exports.Power = Power;
module.exports.Mode = Mode;
module.exports.FanRate = FanRate;
module.exports.FanDirection = FanDirection;
module.exports.Unit = AcUnit;
