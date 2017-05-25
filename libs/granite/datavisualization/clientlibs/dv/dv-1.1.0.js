/*
 * ************************************************************************
 *
 *  ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   (c) Copyright 2012 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 * ************************************************************************
 */

/*
 * dv - v1.1.0 - 2012-11-20
 * Copyright (c) 2012 Adobe Systems, Inc. All Rights Reserved.
 */

(function() {

dv = function() {};
dv.version = "1.1.0";
dv.ANIMATION = true;

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
var initializing = false, fnTest = /xyz/.test(function() { xyz;	}) ? /\b_super\b/ : /.*/;
dv.extend = function(prop) {
	var _super = this.prototype;
	initializing = true;
	var prototype = new this();
	initializing = false;
	for (var name in prop) {
		prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn) {
				return function() {
					var tmp = this._super;
					this._super = _super[name];
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) :
			prop[name];
	}

	function Class() {
		if(!initializing){
			initializing = true;
			var clazz = new arguments.callee();
			initializing = false;
			if(clazz.init)
			{
				clazz.init.apply(clazz, arguments);
			}
			return clazz;
		}

	}

	Class.prototype = prototype;
	Class.mixin = function(name, value) {
		if (_.isObject(name)) {
			_.each(name, function(mixin, name) {
				prototype[name] = value;
			});
		} else {
			prototype[name] = value;
		}
	};
	Class.extend = arguments.callee;

	return Class;
};

dv.DEFAULT_COLORS = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

// Works like jQuery's proxy function, expects a function and the proxy object.
dv.proxy = function (fn, proxy) {
	var context;
	if (proxy && !_.isFunction(proxy)) {
		context = proxy;
		proxy = function() {
			return fn.apply(context || this, arguments);
		};
	}
	return proxy;
};

// Returns the absolute coordinates for a pixel value within a plot.
dv.absoluteCoordinates = function(chart, posWithinPlot) {
	var parentDiv = chart._parent.node().parentNode,
		bounds = chart.plotBounds(),
		x = parentDiv.offsetLeft + bounds.left + posWithinPlot[0],
		y = parentDiv.offsetTop + bounds.top + posWithinPlot[1],
		xScale = chart.getTrainedScale('x'),
		yScale = chart.getTrainedScale('y');

	// TODO: The coordinate system needs to handle this...
	// We centered the SVG group in the middle of the plot with a transform on the plot group since we're in polar, we need to undo that here.
	if (chart.coord() instanceof dv.coord.polar) {
		var xRange = dv.util.scaleRangeNoReverse(xScale),
			yRange = dv.util.scaleRangeNoReverse(yScale);
		x += (xRange[0] + xRange[1]) / 2;
		y += (yRange[0] + yRange[1]) / 2;
	}

	return [x, y];
};

dv.showTooltip = function(pos, content, orientation, padding, parent) {
	var tipDiv = parent.select(".dv-tooltip");

	if (tipDiv.empty()) {
		tipDiv = parent.append("div")
			.classed("dv-tooltip", true);
	}

	tipDiv
		.style("top", 0)
		.style("left", 0)
		.style("opacity", 0)
		.html(content);

	var tipNode = tipDiv.node(),
		width = tipNode.offsetWidth,
		height = tipNode.offsetHeight,
		windowSize = dv.windowDimensions(),
		scrollTop = tipNode.scrollTop,
		scrollLeft = tipNode.scrollLeft,
		top = 0,
		left = 0;

	switch (orientation) {
		case "left" :
			left = pos[0] - width - padding;
			top = pos[1] - height / 2;
			if (left < scrollLeft) left = pos[0] + padding * 2; // flip to right
			if (top < scrollTop) top = scrollTop + 5; // snap to the top
			if (top + height > scrollTop + windowSize.height) top = windowSize.height - height - 5; // snap to the bottom
			break;
		case "right" :
			left = pos[0] + padding * 2;
			top = pos[1] - height / 2;
			if (left + width > scrollLeft + windowSize.width) left = pos[0] - width - padding; // flip to left
			if (top < scrollTop) top = scrollTop + 5; // snap to the top
			if (top + height > scrollTop + windowSize.height) top = windowSize.height - height - 5; // snap to the bottom
			break;
		case "top" :
			left = pos[0] - width / 2;
			top = pos[1] - height - padding;
			if (top < scrollTop) top = pos[1] + padding * 2; // flip to bottom
			if (left < scrollLeft) left = scrollLeft + 5; // snap to the left
			if (left + width > scrollLeft + windowSize.width) left = windowSize.width - width - 5; // snap to the right
			break;
		case "bottom" :
			left = pos[0] - width / 2;
			top = pos[1] + padding * 2;
			if (top + height > scrollTop + windowSize.height) top = pos[1] + padding; // flip to top
			if (left < scrollLeft) left = scrollLeft + 5; // snap to the left
			if (left + width > scrollLeft + windowSize.width) left = windowSize.width - width - 5; // snap to the right
			break;
	}

	tipDiv.style("top", top + "px")
		.style("left", left + "px")
		.transition()
			.duration(500)
			.style("opacity", 0.8);
};

dv.removeTooltip = function() {
	d3.selectAll(".dv-tooltip")
		.transition()
			.delay(350)
			.duration(500)
			.style("opacity", 0)
			.remove();
};

// Returns the dimensions of the current window.
dv.windowDimensions = function() {
	var size = {
		width: 640,
		height: 480
	};
	
	if (document.body && document.body.offsetWidth) {
		size.width = document.body.offsetWidth;
		size.height = document.body.offsetHeight;
	}
	if (document.compatMode=='CSS1Compat' &&
		document.documentElement &&
		document.documentElement.offsetWidth ) {
		size.width = document.documentElement.offsetWidth;
		size.height = document.documentElement.offsetHeight;
	}
	if (window.innerWidth && window.innerHeight) {
		size.width = window.innerWidth;
		size.height = window.innerHeight;
	}
	return size;
};

dv.addWindowResizeHandler = function(func) {
	window.addEventListener("resize", func);
};

dv.removeWindowResizeHandler = function(func) {
	window.removeEventListener("resize", func);
};
dv.scale = dv.extend({
	init: function(d3Scale) {
		this._d3Scale = d3Scale;
		this._reverse = false;
	},

	trainingProperties: function(val) {
		if (!arguments.length) {
			if (this._trainingProperties) return this._trainingProperties;
			if (this._property) return [this._property];
			return undefined;
		}
		this._trainingProperties = val;
		return this;
	},

	trainDomain: function(data, options) {
		var domain = this.calculateDomain(data, options);
		this.domain(domain);
		return domain;
	},

	map: function(obj) {
		return this._d3Scale(obj[this.mapping()]);
	},

	mapToProp: function(obj) {
		return this._d3Scale(obj[this.property()]);
	},

	mapPropToPercent: function(obj) {
		return this.mapValueToPercent(this.mapToProp(obj));
	},

	mapValueToPercent: function(val) {
		var range = dv.util.scaleRange(this);
		return (val - range[0]) / (range[1] - range[0]);
	},

	mapValue: function(val) {
		return this._d3Scale(val);
	},

	invert: function(obj) {
		return this._d3Scale.invert(obj[this.mapping()]);
	},

	invertFromProp: function(obj) {
		return this._d3Scale.invert(obj[this.property()]);
	},

	invertValue: function(val) {
		return this._d3Scale.invert(val);
	},

	rangeBand: function(val) {
		return 0;
	},

	reverse: function(val) {
		if (!arguments.length) return this._reverse;

		if (this._reverse != val) {
			this._reverse = val;

			var domain = this._d3Scale.domain() || [];
			this._d3Scale.domain(domain.reverse());
		}
		return this;
	},

	property: function(val) {
		if (!arguments.length) return this._property;
		this._property = val;
		return this;
	},

	mapping: function(val) {
		if (!arguments.length) return this._mapping;
		this._mapping = val;
		return this;
	},

	/**
	 * An unreversed domain.  For continuous scales, this represents the limits of the domain (e.g. [0, 50]).
	 * For ordinal scales, this represents a unique set of all values (e.g. ["USA", "Mexico", "Canada", "Brazil"]).
	 */
	domain: function(val) {
		if (!arguments.length) return this._d3Scale.domain();
		if (!this._d3Scale) return this;
		val = this._reverse ? val.reverse() : val;
		this._d3Scale.domain(val);
		return this;
	},

	range: function(val) {
		if (!arguments.length) return this._d3Scale.range();
		if (!this._d3Scale) return this;
		this._d3Scale.range(val);
		return this;
	},

	name: function(val) {
		if (!arguments.length) return this._name;
		this._name = val;
		return this;
	},

	expand: function(val) { // TODO: Implement me
		if (!arguments.length) return this._expand;
		this._expand = val;
		return this;
	},

	limits: function(val) { // TODO: Implement me
		if (!arguments.length) return this._limits;
		this._limits = val;
		return this;
	},

	breaks: function(val) { // TODO: Implement me
		if (!arguments.length) return this._breaks;
		this._breaks = val;
		return this;
	},

	orientation: function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	},

	copy: function() {
		throw new Error("A copy function was not specified for the scale subclass.");
	}
});
/**
 * dv.scale.constant is simply a placeholder for constant values that shouldn't be mapped.
 * It is used internally when an aesthetic is supplied with a primitive value instead of
 * an aesthetic.
 */
dv.scale.constant = dv.scale.extend({
	init: function() {
		this._super(null);
	},
	
	trainDomain: function(data) {
		return;
	},
	
	map: function(val) {
		return this._value; // There is no translation required.
	},
	
	mapToProp: function(val) {
		return this._value; // There is no translation required.
	},
	
	value: function(val) {
		if (!arguments.length) return this._value;
		this._value = val;
		return this;
	},
	
	copy: function(val) {
		return dv.scale.constant()
			.value(this.value())
			.property(this.property())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.continuous = dv.scale.extend({
	init: function(scale) {
		this._super(scale ? scale : d3.scale.linear());
	},

	/**
	 * Returns an unreversed continuous domain.  Reversing should automatically be done when the returned value
	 * is passed to the scale's domain setter if it is required.
	 */
	calculateDomain: function(data, options) {
		var domain = [],
			_min,
			_max;

		if (!_.isUndefined(this._upperLimit) && !_.isFunction(this._upperLimit) 
				&& !_.isUndefined(this._lowerLimit) && !_.isFunction(this._lowerLimit)) {
			domain = this.limits();
		} 
		else {
			if (options.fill) {
				this.domain([0, 100]); // 0 to 100 percent
				return this.domain();
			} 
			else {
				var trainingProps = this.trainingProperties();
				for (var p = 0; p < trainingProps.length; p++) {
					var prop = trainingProps[p];
					for(var i = 0; i < data.length; i++) {
						var values = data[i].values;
						for(var j = 0; j < values.length; j++) {
							var val = (options.stack) ? values[j].y0 : values[j][prop];
							_min = (_.isUndefined(_min) || val < _min) ? val : _min;

							if(options.stack && i === data.length-1) {
								val += values[j][prop];
							}
							_max = (_.isUndefined(_max) || val > _max) ? val : _max;
						}
					}
				}
				domain = [_min, _max];
			}

			if (!_.isUndefined(this._lowerLimit)) 
				domain[0] = _.isFunction(this._lowerLimit) ? this._lowerLimit(_min, _max) : this._lowerLimit;

			if (!_.isUndefined(this._upperLimit)) 
				domain[1] = _.isFunction(this._upperLimit) ? this._upperLimit(_min, _max) : this._upperLimit;
		}

		return domain;
	},

	unionDomain: function(domain, isReversed) {
		if (domain && (!_.isArray(domain) || domain.length != 2)) throw new Error("The supplied union is not an array of length 2.");
		if (domain) {
			// TODO: We eventually need to get smarter about situations where we are unioning a reversed and
			// unreversed domain.  This will ideally create a situation where we have multiple axes.  For now
			// we'll say if one of them is reversed, the current unioned scale will be reversed as well.
			this.reverse(isReversed || this._reverse);
			this.domain(this.domain() ? d3.extent(this.domain().concat(domain)) : domain);
		}
		return this;
	},

	/**
	 *	
	 */
	upperLimit: function(val) {
		if (!arguments.length) return this._upperLimit;
		this._upperLimit = val;
		return this;
	},

	lowerLimit: function(val) {
		if (!arguments.length) return this._lowerLimit;
		this._lowerLimit = val;
		return this;
	},

	limits: function(val) {
		if (!arguments.length) return [this._lowerLimit, this._upperLimit];
		if (!val || val.length != 2) throw new Error("The limits function must supply a lower and upper limit wrapped within an array.");
		this._lowerLimit = val[0];
		this._upperLimit = val[1];
		return this;
	},

	name: function(val) {
		if (!arguments.length) return this._name;
		this._name = val;
		return this;
	},

	labels: function(val) { // TODO: Implement me
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	},

	to: function(val) {
		if (!arguments.length) return this._to;
		this._to = val;
		this.range(val);
		return this;
	},

	copy: function() {
		return dv.scale.continuous()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.range(this.range())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.linear = dv.scale.continuous.extend({
	init: function() {
		this._super(d3.scale.linear());
	},
	
	copy: function() {
		return dv.scale.linear()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.range(this.range())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.time = dv.scale.continuous.extend({
	init: function() {
		this._super(d3.time.scale());
	},
	
	copy: function() {
		return dv.scale.time()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.range(this.range())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.time.utc = dv.scale.continuous.extend({
	init: function() {
		this._super(d3.time.scale.utc());
	},
	
	copy: function() {
		return dv.scale.time.utc()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.range(this.range())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.ordinal = dv.scale.extend({
	init: function() {
		this._super(d3.scale.ordinal());
		this._defaultPadding = 0.1;
		this._defaultOuterPadding = 0;
		this._rangeExtent = [];
		this._rangeBandsSet = false;
	},

	/**
	 * Returns an unreversed continuous domain.  Reversing should automatically be done when the returned value
	 * is passed to the scale's domain setter if it is required.
	 */
	calculateDomain: function(data, options) {
		var tuple = [], trainingProps = this.trainingProperties();
		for (var p = 0; p < trainingProps.length; p++) {
			var prop = trainingProps[p];
			for(var i = 0; i < data.length; i++) {
				var values = data[i].values;
				for(var j = 0; j < values.length; j++) {
					tuple.push(values[j][prop]);
				}
			}
		}
		var domain = tuple ? _.uniq(tuple) : null;

		return domain;
	},

	unionDomain: function(domain, isReversed) {
		if (domain && !_.isArray(domain)) throw new Error("The supplied union is not an array");
		if (domain) {
			this.reverse(isReversed || this._reverse);
			this.domain(this.domain() ? _.union(this.domain(), domain) : domain);
		}
		return this;
	},

	invertValue: function(val) {
		var index = this.range().indexOf(val),
			domain = this.domain();
		if (index < 0) throw new Error("The supplied value does not exist in the specified range.");
		
		return domain[index % domain.length];
	},

	reverse: function(val) {
		if (!arguments.length) return this._reverse;

		if (this._reverse != val) {
			this._reverse = val;

			var domain = this._d3Scale.domain() || [];
			this._d3Scale.domain(domain.reverse());
		}
		return this;
	},

	padding: function(val) {
		if (!arguments.length) return _.isUndefined(this._padding) ? this._defaultPadding : this._padding;
		this._padding = val;

		if (this._rangeBandsSet) {
			this._d3Scale.rangeBands(this.rangeExtent(), this._padding, this.outerPadding());
		}
		return this;
	},

	outerPadding: function(val) {
		if (!arguments.length) return _.isUndefined(this._outerPadding) ? (_.isUndefined(this._padding) ? this._defaultOuterPadding : this.padding()) : this._outerPadding;
		this._outerPadding = val;

		if (this._rangeBandsSet) {
			this._d3Scale.rangeBands(this.rangeExtent(), this.padding(), this._outerPadding);
		}
		return this;
	},

	rangeBands: function(val) {
		if (!arguments.length) return this._d3Scale.range();
		this._rangeBandsSet = true;
		this._d3Scale.rangeBands(val, this.padding(), this.outerPadding());
		this.rangeExtent(val);
		return this;
	},

	rangeBand: function() {
		return this._d3Scale.rangeBand();
	},

	range: function(val) {
		if (!arguments.length) return this._d3Scale.range();
		if (!this._d3Scale) return this;
		this._d3Scale.range(val);
		this.rangeExtent([val[0], val[val.length - 1]]);
		return this;
	},

	rangeExtent: function(val) {
		if (!arguments.length) return this._rangeExtent;
		this._rangeExtent = val;
		return this;
	},

	values: function(val) {
		if (!arguments.length) return this._d3Scale.range();
		return this.range(val);
	},

	drop: function(val) {
		if (!arguments.length) return this._drop;
		this._drop = val;
		return this;
	},

	copy: function() {
		var scale = dv.scale.ordinal()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.range(this.range())
			.rangeExtent(this.rangeExtent())
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(this.trainingProperties());

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent());
		}

		return scale;
	}
});
dv.scale.color = dv.scale.ordinal.extend({
	init: function() {
		this._super();
		this.range(dv_qualitative16);
	},
	
	copy: function() {
		var scale = dv.scale.ordinal()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.range(this.range())
			.rangeExtent(this.rangeExtent())
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(this.trainingProperties());

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent())
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	}
});

var dv_qualitative16 = [ "#82BE50", "#465A9B", "#DC2D5F", "#3287D2", "#F08C1E", "#419687", "#A03282", "#EB642D", "#8287E6", "#CDD250", "#5AD2D2", "#C81E8C", "#5FAF69", "#EB3C37", "#5AAFD7", "#F5C841" ];
dv.scale.shape = dv.scale.ordinal.extend({
	init: function() {
		this._super();
		this.range(dv_shape);
	},
	
	copy: function() {
		var scale = dv.scale.ordinal()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.range(this.range())
			.rangeExtent(this.rangeExtent())
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(this.trainingProperties());

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent())
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	}
});

var dv_shape = [ "circle", "cross", "diamond", "square", "triangle-down", "triangle-up" ];
dv.scale.linetype = dv.scale.ordinal.extend({
	init: function() {
		this._super();
		this.range(dv_linetype);
	},
	
	copy: function() {
		var scale = dv.scale.ordinal()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.range(this.range())
			.rangeExtent(this.rangeExtent())
			.reverse(this.reverse())
			.padding(this._padding)
			.outerPadding(this._outerPadding)
			.trainingProperties(this.trainingProperties());

		if (this._rangeBandsSet) {
			scale.rangeBands(this.rangeExtent())
				.padding(this._padding)
				.outerPadding(this._outerPadding);
		}

		return scale;
	}
});

var dv_linetype = [ "solid", "dashed", "dotted", "dotdash", "longdash", "twodash" ];
dv.scale.size = dv.scale.continuous.extend({
	init: function() {
		this._super();
	},
	
	copy: function() {
		return dv.scale.size()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.upperLimit(this.upperLimit())
			.lowerLimit(this.lowerLimit())
			.range(this.range())
			.to(this.to())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.scale.identity = dv.scale.ordinal.extend({
	init: function(scale) {
		this._super(d3.scale.ordinal());
	},
	
	mapToProp: function(obj) { // We should probably be able to remove this if the identity scale is trained correctly.
		return obj[this.property()];
	},

	domain: function(val) {
		if (!arguments.length) return this._d3Scale.domain();
		if (!this._d3Scale) return this;
		val = this._reverse ? val.reverse() : val;
		this._d3Scale.domain(val);
		this._d3Scale.range(val);
		return this;
	},

	range: function() {
		if (!arguments.length) return this._d3Scale.range();
		return this;
	},

	name: function(val) {
		if (!arguments.length) return this._name;
		this._name = val;
		return this;
	},
	
	labels: function(val) { // TODO: Implement me
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	},
	
	copy: function() {
		return dv.scale.identity()
			.property(this.property())
			.mapping(this.mapping())
			.domain(this.domain())
			.range(this.range())
			.reverse(this.reverse())
			.trainingProperties(this.trainingProperties());
	}
});
dv.svg = dv.svg || {};

dv.svg.text = function() {
	var x = dv_svg_textX,
		y = dv_svg_textY,
		label = dv_svg_textLabel,
		defined = dv_svg_textDefined,
		duration = dv_svg_textDuration;

	function text(selection) {
		return selection
			.select(function(d, i) { return defined.call(this, d, i) ? this : null; }) // filter out the undefined results.
			.attr('x', function(d, i) { return x.call(this, d, i); })
			.attr('y', function(d, i) { return y.call(this, d, i); })
			.text(function(d, i) { return label.call(this, d, i); });
	}

	text.x = function(val) {
		if (!arguments.length) return x;
		x = val;
		return text;
	};

	text.y = function(val) {
		if (!arguments.length) return y;
		y = val;
		return text;
	};

	text.label = function(val) {
		if (!arguments.length) return label;
		label = val;
		return text;
	};

	text.defined = function(val) {
		if (!arguments.length) return defined;
		defined = val;
		return text;
	};

	text.duration = function(val) {
		if (!arguments.length) return duration;
		duration = val;
		return text;
	};

	return text;
};

dv.svg.text.radial = function() {
	var angle = dv_svg_textX,
		radius = dv_svg_textY,
		label = dv_svg_textLabel,
		defined = dv_svg_textDefined,
		duration = dv_svg_textDuration;

	function text(selection) {
			var a = function(d, i) { return angle.call(this, d, i) + dv_svg_arcOffset; },
				r = function(d, i) { return radius.call(this, d, i); };
			return selection
				.select(function(d, i) { return defined.call(this, d, i) ? this : null; }) // filter out the undefined results.
				.attr('x', function(d, i) { return r(d, i) * Math.cos(a(d, i)); })
				.attr('y', function(d, i) { return r(d, i) * Math.sin(a(d, i)); })
				.text(function(d, i) { return label.call(this, d, i); });
	}

	text.angle = function(val) {
		if (!arguments.length) return x;
		angle = val;
		return text;
	};

	text.radius = function(val) {
		if (!arguments.length) return y;
		radius = val;
		return text;
	};

	text.label = function(val) {
		if (!arguments.length) return label;
		label = val;
		return text;
	};

	text.defined = function(val) {
		if (!arguments.length) return defined;
		defined = val;
		return text;
	};

	text.duration = function(val) {
		if (!arguments.length) return duration;
		duration = val;
		return text;
	};

	return text;
};

function dv_svg_textX(d) {
	return d[0];
}

function dv_svg_textY(d) {
	return d[1];
}

function dv_svg_textLabel(d) {
	return d[2];
}

function dv_svg_textDefined() {
	return true;
}

function dv_svg_textDuration() {
	return 0;
}

dv.svg.rect = function() {
	var x0 = dv_svg_rectX0,
		x1 = dv_svg_rectX1,
		y0 = dv_svg_rectY0,
		y1 = dv_svg_rectY1,
		defined = dv_svg_rectDefined;

	function rect(d, i) {
		if (defined.call(this, d, i)) {
			return dv_svg_rect(x0.call(this, d, i), x1.call(this, d, i), y0.call(this, d, i), y1.call(this, d, i));
		}
		return null;
	}

	rect.x0 = function(val) {
		if (!arguments.length) return x0;
		x0 = val;
		return rect;
	};

	rect.x1 = function(val) {
		if (!arguments.length) return x1;
		x1 = val;
		return rect;
	};

	rect.y0 = function(val) {
		if (!arguments.length) return y0;
		y0 = val;
		return rect;
	};

	rect.y1 = function(val) {
		if (!arguments.length) return y1;
		y1 = val;
		return rect;
	};

	rect.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return rect;
	};

	return rect;
};

function dv_svg_rectX0(d) {
	return d[0];
}

function dv_svg_rectX1(d) {
	return d[1];
}

function dv_svg_rectY0(d) {
	return d[2];
}

function dv_svg_rectY1(d) {
	return d[3];
}

function dv_svg_rectDefined() {
	return true;
}

function dv_svg_rect(x0, x1, y0, y1) {
	// return "M" + x0 + "," + y0 + "L" + x1 + "," + y0 + " A0,0,0,0,1," + x1 + "," + y0 + 
	//	" L" + x1 + "," + y1 + " A0,0,0,0,1," + x1 + "," + y1 +
	//	" L" + x0 + "," + y1 + " A0,0,0,0,1," + x0 + "," + y1 +
	//	" L" + x0 + "," + y0 + " A0,0,0,0,1," + x0 + "," + y0 + "Z";
	return "M" + x0 + "," + y0 +
			"L" + x1 + "," + y0 +
			"L" + x1 + "," + y1 +
			"L" + x0 + "," + y1 + "Z";
	//return "M" + x0 + "," + y0 + "A0,0 0 0,1 " + x1 + "," + y0 + "L" + x1 + "," + y1 + "A280000,280000 0 0,0 " + x0 + "," + y1 + "Z";
}

dv.svg.symbol = function() {
	var type = dv_svg_symbolType,
		size = dv_svg_symbolSize,
		x = dv_svg_symbolX,
		y = dv_svg_symbolY,
		defined = dv_svg_symbolDefined;

	function symbol(d, i) {
		if (defined.call(this, d, i)) {
			return (dv_svg_symbols[type.call(this, d, i)]
				|| dv_svg_symbols.circle)
				(size.call(this, d, i), x.call(this, d, i), y.call(this, d, i));
		}
		return null;
	}

	symbol.x = function(val) {
		if (!arguments.length) return x;
		x = val;
		return symbol;
	};

	symbol.y = function(val) {
		if (!arguments.length) return y;
		y = val;
		return symbol;
	};

	symbol.type = function(x) {
		if (!arguments.length) return type;
		type = d3.functor(x);
		return symbol;
	};

	// size of symbol in square pixels
	symbol.size = function(x) {
		if (!arguments.length) return size;
		size = d3.functor(x);
		return symbol;
	};

	symbol.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return symbol;
	};

	return symbol;
};

dv.svg.symbol.radial = function() {
	var type = dv_svg_symbolType,
		size = dv_svg_symbolSize,
		angle = dv_svg_symbolX,
		radius = dv_svg_symbolY,
		defined = dv_svg_symbolDefined;

	function symbol(d, i) {
		if (defined.call(this, d, i)) {
			var a = angle.call(this, d, i) + dv_svg_arcOffset,
				r = radius.call(this, d, i),
				x = r * Math.cos(a),
				y = r * Math.sin(a);
			return (dv_svg_symbols[type.call(this, d, i)]
				|| dv_svg_symbols.circle)
				(size.call(this, d, i), x, y);
		}
		return null;
	}

	symbol.angle = function(val) {
		if (!arguments.length) return angle;
		angle = val;
		return symbol;
	};

	symbol.radius = function(val) {
		if (!arguments.length) return radius;
		radius = val;
		return symbol;
	};

	symbol.type = function(x) {
		if (!arguments.length) return type;
		type = d3.functor(x);
		return symbol;
	};

	// size of symbol in square pixels
	symbol.size = function(x) {
		if (!arguments.length) return size;
		size = d3.functor(x);
		return symbol;
	};

	symbol.defined = function(x) {
		if (!arguments.length) return defined;
		defined = x;
		return symbol;
	};

	return symbol;
};

d3.svg.symbolTypes = d3.keys(dv_svg_symbols);

// TODO cross-diagonal?
var dv_svg_symbols = {
	"circle": function(size, x, y) {
		var r = Math.sqrt(size / Math.PI);
		return "M" + x + "," + (y + r)
			+ "A" + r + "," + r + " 0 1,1 " + x + "," + (y - r)
			+ "A" + r + "," + r + " 0 1,1 " + x + "," + (y + r)
			+ "Z";
	},
	"cross": function(size, x, y) {
		var r = Math.sqrt(size / 5) / 2;
		return "M" + (x + -3 * r) + "," + (y - r)
			+ "H" + (x - r)
			+ "V" + (y + -3 * r)
			+ "H" + (x + r)
			+ "V" + (y - r)
			+ "H" + (x + 3 * r)
			+ "V" + (y + r)
			+ "H" + (x + r)
			+ "V" + (y + 3 * r)
			+ "H" + (x - r)
			+ "V" + (y + r)
			+ "H" + (x -3 * r)
			+ "Z";
	},
	"diamond": function(size, x, y) {
		var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
		return "M" + x + "," + (y - ry)
			+ "L" + (x + rx) + "," + y
			+ " " + x + "," + (y + ry)
			+ " " + (x - rx) + "," + y
			+ "Z";
	},
	"square": function(size, x, y) {
		var r = Math.sqrt(size) / 2;
		return "M" + (x - r) + "," + (y - r)
			+ "L" + (x + r) + "," + (y - r)
			+ " " + (x + r) + "," + (y + r)
			+ " " + (x - r) + "," + (y + r)
			+ "Z";
	},
	"triangle-down": function(size, x, y) {
		var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
		return "M" + x + "," + (y + ry)
			+ "L" + (x + rx) + "," + (y - ry)
			+ " " + (x - rx) + "," + (y - ry)
			+ "Z";
	},
	"triangle-up": function(size, x, y) {
		var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
		return "M" + x + "," + (y - ry)
			+ "L" + (x + rx) + "," + (y + ry)
			+ " " + (x - rx) + "," + (y + ry)
			+ "Z";
	}
};

function dv_svg_symbolSize() {
	return 64;
}

function dv_svg_symbolType() {
	return "circle";
}

function dv_svg_symbolX(d) {
	return d[0];
}

function dv_svg_symbolY(d) {
	return d[1];
}

function dv_svg_symbolDefined(d) {
	return true;
}

var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * Math.PI / 180);

var dv_svg_arcOffset = -Math.PI / 2;
dv.util = {};

/**
 * Converts a data format from an object of tuples:
 * {
 *      x: [0, 0, 1, 1, 2, 2],
 *      y: [10, 22, 43, 17, 23, 34],
 *      series: ['one', 'two', 'one', 'two', 'one', 'two']
 * }
 * into a zip array:
 * [
 *      {x: 0, y: 10, series: 'one'}
 *      {x: 1, y: 43, series: 'one'}
 *      {x: 2, y: 23, series: 'one'}
 * ]
 *
 * where the filterKey is the tuple we are grouping (ex. series) and filterValue is the value for which an object is included (ex. 'one').  If
 * no filterKey or filterValue are specified, no filtering will occur, but the tuples will still be transformed into a zip array.
 */
dv.util.filterAndZip = function(data, filterKey, filterValue) {
	var sampleArray = [],
		result = [];

	if (!filterKey) {
		for (var k in data) { sampleArray = data[k]; break; } // Grab the first tuple -- we assume they all have the same length.
	}
	else {
		sampleArray = data[filterKey]; // Otherwise we'll use the filter tuple instead.
	}

	var i = -1,
		len = sampleArray.length;
	while (++i < len) {
		var cursor = sampleArray[i];

		if (!filterValue || cursor == filterValue) {
			var sliceObj = {};
			for (var k2 in data) {
				if (k2 === "data") {
					sliceObj[k2] = {};
					for (var k3 in data[k2]) {
						sliceObj[k2][k3] = data[k2][k3][i];
					}
				} else {
					sliceObj[k2] = data[k2][i];
				}
			}
			result.push(sliceObj);
		}
	}

	return result;
};

dv.util.binaryCompare = function(a, x, f, lo, hi) {
	var tempLo = lo;

	if (arguments.length < 4) tempLo = 0;
	if (arguments.length < 5) hi = a.length;
	while (tempLo < hi) {
		var mid = (tempLo + hi) >> 1;
		if (x < f(a[mid])) hi = mid;
		else tempLo = mid + 1;
	}

	if (tempLo == lo || Math.abs(f(a[tempLo]) - x) < Math.abs(f(a[tempLo - 1]) - x)) return tempLo;
	else return tempLo - 1;
};

/**
 * Returns the range of the given scale.
 */
dv.util.scaleRange = function(scale, range) {
	if (arguments.length === 1) return scale.rangeExtent ? scale.rangeExtent() : scale.range();
	if (scale.rangeExtent)
		scale.rangeBands(range);
	else
		scale.range(range);
	return scale;
};

/**
 * Returns the range of the given scale from min to max always.
 */
dv.util.scaleRangeNoReverse = function(scale) {
	return scale.rangeExtent ? scale.rangeExtent() : dv.util.scaleExtent(scale.range());
};

/**
 * Returns the extent of a given domain array.  It will always be ordered from min to max.
 */
dv.util.scaleExtent = function(domain) {
	var start = domain[0], stop = domain[domain.length - 1];
	return start < stop ? [ start, stop ] : [ stop, start ];
};

/**
 * Returns an object which is the result of merging the properties of the two objects. obj2 takes 
 * precedence over obj1 when they have like properties.  Neither objects are changed.
 */
dv.util.merge = function(obj1, obj2) {
	var retVal = {};
	for (var prop in obj1) { retVal[prop] = obj1[prop]; }
	for (var prop in obj2) { retVal[prop] = obj2[prop]; }
	return retVal;
};
dv.util = dv.util || {};
dv.util.svg = {};

// Allows passing in user-friendly linetype formats such as solid, dashed, dotted, etc (see dv.scale.linetype for accepted values) and
// returns a dasharray. If the key is already in dasharray format, it just returns itself.
dv.util.svg.getDasharray = function(key) {
	if (key.indexOf(',') != -1 || key.indexOf(' ') != -1) return key; // It's already in dasharray format just return it.
	if (dv_dasharray.hasOwnProperty(key)) return dv_dasharray[key];
	throw new Error("The dashed line format is invalid");
};

var dv_dasharray = {
	"solid": "",
	"dashed": "7,4",
	"dotted": "2,3",
	"dotdash": "2,3,7,4",
	"longdash": "11,4",
	"twodash": "5,2,11,2"
};
dv.container = dv.extend({
	scaleDefaults: {
		'x': dv.scale.linear(),
		'y': dv.scale.linear(),
		'yMin': dv.scale.linear(),
		'yMax': dv.scale.linear(),
		'xMin': dv.scale.linear(),
		'xMax': dv.scale.linear(),
		'color': dv.scale.color(),
		'fill': dv.scale.color(),
		'stroke': dv.scale.color(),
		'alpha': dv.scale.linear().to([0, 1]),
		'shape': dv.scale.shape(),
		'size': dv.scale.size().to([2, 10]),
		'radius': dv.scale.linear(),
		'group': dv.scale.ordinal(),
		'linetype': dv.scale.linetype(),
		'label': dv.scale.identity()
	},

	categoricalAes: [ 'color', 'fill', 'stroke', 'shape', 'size', 'linetype' ], // Categorical aes can be used to group data instead of explicitly defining a group.

	init:function() {
		this._aes = {};
	},

	render: function() {
		throw new Error("render() must be implemented in a subclass");
	},

	_prerender: function() {
		this._calculateStats();
		this._handlePositions();
		this._trainScales();
	},

	_calculateStats: function() {
		throw new Error("_calculateStats() must be implemented in a subclass");
	},

	_handlePositions: function() {
		throw new Error("_handlePositions() must be implemented in a subclass");
	},

	getTrainedScale: function(prop) {
		throw new Error("getTrainedScale() must be implemented in a subclass");
	},

	getExplicitScalesMap: function() {
		return this._aes;
	},

	_normalizeData: function(data) {
		// The data is already normalized, return it back out.
		if (data.hasOwnProperty("data") && !_.isArray(data.data)) return data;

		var normalizedData = {},
			map = this.getExplicitScalesMap();
		_.each(map, function(d, i) {
			if (!(d instanceof dv.scale.constant)) {
				var arr = data[d.mapping()];
				if (_.isArray(arr)) {
					normalizedData[d.property()] = arr;
				}
			}
		});
		normalizedData.data = data;
		return normalizedData;
	},

	map: function(property, mapping, scale) {
		if (!scale) scale = this.scaleDefaults[property].copy();
		if (!scale) throw new Error("There is no default scale associated with this property. Either the property isn't valid or the scale default doesn't exist.");
		this._aes[property] = scale.property(property).mapping(mapping);
		return this;
	},

	set: function(property, val) {
		var scale = this._aes[property] = dv.scale.constant();
		if (_.isFunction(val)) {
			scale.map = val; 
			scale.mapToProp = val;
		}
		else scale.value(val);
		return this;
	},

	on: function(eventType, callback, capture) {
		var adding = callback && _.isFunction(callback);
		if (adding) {
			this.eventMap = this.eventMap || {};
			this.eventMap[eventType] = {callback: callback, capture: capture};
		}
		else {
			if (this.eventMap) delete this.eventMap[eventType];
			this.unregisterEventMap = this.unregisterEventMap || {};
			this.unregisterEventMap[eventType] = capture;
		}

		this._removeRegisteredEvents();
		this._addRegisteredEvents();

		return this;
	},
	
	// Positions include:
	// dodge
	// fill
	// identity
	// jitter -- not currently supported
	// stack
	// Grammar of Graphics, p. 59
	position: function(val) {
		if (!arguments.length) return (this._chart && !this._position) ? this._chart.position() : this._position;
		this._position = val;
		return this;
	},

	delay: function(val) {
		if (!arguments.length) return (this._chart && _.isUndefined(this._delay)) ? this._chart.delay() : this._delay;
		this._delay = d3.functor(val);
		return this;
	},

	duration: function(val) {
		if (!arguments.length) return (this._chart && _.isUndefined(this._duration)) ? this._chart.duration() : this._duration;
		this._duration = d3.functor(val);
		return this;
	},

	ease: function(val) {
		if (!arguments.length) return (this._chart && _.isUndefined(this._ease)) ? this._chart.ease() : this._ease;
		this._ease = val;
		return this;
	}
});
/**
 * User: nross
 * Date: 2/24/12
 * Time: 2:55 PM
 */
(function() {

dv.coord = dv.extend({
	init: function() {
		this._flip = false;
	},
	flip: function(val) {
		if (!arguments.length) return this._flip;
		this._flip = val;
		return this;
	},
	startX: function(val) {
		if (!arguments.length) return this._startX;
		this._startX = val;
		return this;
	},
	endX: function(val) {
		if (!arguments.length) return this._endX;
		this._endX = val;
		return this;
	},
	startY: function(val) {
		if (!arguments.length) return this._startY;
		this._startY = val;
		return this;
	},
	endY: function(val) {
		if (!arguments.length) return this._endY;
		this._endY = val;
		return this;
	}
});


})();
/**
 * User: nross
 * Date: 3/21/12
 * Time: 9:58 AM
 */
dv.coord.cartesian = dv.coord.extend({
	init: function() {
		this.startX(0);
		this.endX(0);
		this.startY(0);
		this.endY(0);
		this._type = "cartesian";
	},
	startX: function(val) {
		if (!arguments.length) return this._startX;
		this._startX = val;
		return this;
	},
	endX: function(val) {
		if (!arguments.length) return this._endX;
		this._endX = val;
		return this;
	},
	startY: function(val) {
		if (!arguments.length) return this._startY;
		this._startY = val;
		return this;
	},
	endY: function(val) {
		if (!arguments.length) return this._endY;
		this._endY = val;
		return this;
	},

	translatePercentToX: function(scale, percent) {
		var range = dv.util.scaleRange(scale);
		return ((range[1] - range[0]) - this.endX() - this.startX()) * percent + this.startX() + range[0];
	},
	translatePercentToY: function(scale, percent) {
		var range = dv.util.scaleRange(scale);
		return (((range[1] - range[0]) - this.endY() - this.startY()) * percent + this.startY()) + range[0];
	},

	text: function(xScale, yScale) {
		var self = this;

		function text(d, i) {
			var renderer = dv.svg.text();

			if (self._flip) {
				return renderer
					.x( function(d, i) { return self.translatePercentToY(xScale, text.y()(d, i)); })
					.y( function(d, i) { return self.translatePercentToX(yScale, text.x()(d, i)); });
			}
			else {
				return renderer
					.x( function(d, i) { return self.translatePercentToX(xScale, text.x()(d, i)); })
					.y( function(d, i) { return self.translatePercentToY(yScale, text.y()(d, i)); });
			}
		}

		text.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		text.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		return text;
	},

	point: function(xScale, yScale) {
		var self = this,
			point = {};

		point.renderer = dv.svg.symbol()
			.x(function(d, i) { return d.bounds.x; })
			.y(function(d, i) { return d.bounds.y; });

		point.getBounds = function(d, i) {
			if (!point._defined(d, i)) return null;
			if (self._flip) {
				d.bounds = {
					x: self.translatePercentToX(xScale, point.y()(d, i)),
					y: self.translatePercentToY(yScale, point.x()(d, i))
				};
			} 
			else {
				d.bounds =  {
					x: self.translatePercentToX(xScale, point.x()(d, i)),
					y: self.translatePercentToY(yScale, point.y()(d, i))
				};
			}
			return d;
		};

		point.getPath = function(obj) {
			return (obj === null) ? null : point.renderer(obj);
		};

		point.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return point;
		};

		point.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return point;
		};

		point.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return point;
	},

	line: function(xScale, yScale) {
		var self = this,
			line = {};

		line.renderer = d3.svg.line()
				.x(function(d, i) { return d.bounds.x; })
				.y(function(d, i) { return d.bounds.y; });

		line.getBounds = function(seriesD, seriesI) {
			_.each(seriesD, function(d, i) {
				if (line._defined(d, i)) {
					if (self._flip) {
						d.bounds = {
							x: self.translatePercentToX(xScale, line.y()(d, i)),
							y: self.translatePercentToY(yScale, line.x()(d, i))
						};
					} else {
						d.bounds = {
							x: self.translatePercentToX(xScale, line.x()(d, i)),
							y: self.translatePercentToY(yScale, line.y()(d, i))
						};
					}
				}
				else {
					seriesD.splice(i, 1);
				}
			});
			return seriesD;
		};

		line.getPath = function(obj) {
			return (obj === null) ? null : line.renderer(obj);
		};

		line.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		line.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		line.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return line;
	},

	area: function(xScale, yScale) {
		var self = this,
			area = {};

		area.renderer = d3.svg.area();

		area.getBounds = function(seriesD, seriesI) {
			var sd = [];
			area.setupRenderer();
			_.each(seriesD, function(d, i) {
				if (area._defined(d, i)) {
					var newD = _.clone(d);
					if (self._flip) {
						newD.bounds = {
							x: self.translatePercentToY(yScale, area.x()(d, i)),
							y0: self.translatePercentToX(xScale, area.y0()(d, i)),
							y1: self.translatePercentToX(xScale, area.y1()(d, i))
						};
					} else {
						newD.bounds = {
							x: self.translatePercentToX(xScale, area.x()(d, i)),
							y0: self.translatePercentToY(yScale, area.y0()(d, i)),
							y1: self.translatePercentToY(yScale, area.y1()(d, i))
						};
					}
					sd.push(newD);
				}
			});
			return sd;
		};

		area.getPath = function(obj) {
			area.setupRenderer();
			return (obj === null) ? null : area.renderer(obj);
		};

		area.setupRenderer = function() {
			if (self._flip) {
				area.renderer.x(null)
					.y0(null)
					.y1(null)
					.y(function(d, i) { return d.bounds.x; })
					.x0(function(d, i) { return d.bounds.y0; })
					.x1(function(d, i) { return d.bounds.y1; });
			}
			else {
				area.renderer.y(null)
					.x0(null)
					.x1(null)
					.x(function(d, i) { return d.bounds.x; })
					.y0(function(d, i) { return d.bounds.y0; })
					.y1(function(d, i) { return d.bounds.y1; });
			}
		};

		area.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		area.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		area.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		area.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return area;
	},
	
	rect: function(xScale, yScale) {
		var self = this,
			rect = {};

		rect.renderer = dv.svg.rect()
			.x0(function(d, i) { return d.bounds.x0; })
			.x1(function(d, i) { return d.bounds.x1; })
			.y0(function(d, i) { return d.bounds.y0; })
			.y1(function(d, i) { return d.bounds.y1; });

		rect.getBounds = function(d, i) {
			var newD = _.clone(d);
			if (!rect._defined(newD, i)) return null;
			if (self._flip) {
				newD.bounds = {
					x0: self.translatePercentToX(xScale, rect.y0()(newD, i)),
					x1: self.translatePercentToX(xScale, rect.y1()(newD, i)),
					y0: self.translatePercentToY(yScale, rect.x0()(newD, i)),
					y1: self.translatePercentToY(yScale, rect.x1()(newD, i))
				};
			} else {
				newD.bounds = {
					x0: self.translatePercentToX(xScale, rect.x0()(newD, i)),
					x1: self.translatePercentToX(xScale, rect.x1()(newD, i)),
					y0: self.translatePercentToY(yScale, rect.y0()(newD, i)),
					y1: self.translatePercentToY(yScale, rect.y1()(newD, i))
				};
			}
			return newD;
		};

		rect.getPath = function(obj) {
			return (obj === null) ? null : rect.renderer(obj);
		};

		rect.x0 = function(val) {
			if (!arguments.length) return this._x0;
			this._x0 = val;
			return this;
		};

		rect.x1 = function(val) {
			if (!arguments.length) return this._x1;
			this._x1 = val;
			return this;
		};

		rect.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		rect.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		rect.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return rect;
	}
});
/**
 * User: nross
 * Date: 3/21/12
 * Time: 10:00 AM
 */
dv.coord.polar = dv.coord.extend({
	init: function() {
		this.innerRadius(0);
		this.outerRadius(0);
		this.startAngle(0);
		this.endAngle(360);
		this._type = "polar";
	},
	innerRadius: function(val) {
		if (!arguments.length) return this.startY();
		this.startY(val);
		return this;
	},
	outerRadius: function(val) {
		if (!arguments.length) return this.endY();
		this.endY(val);
		return this;
	},
	startAngle: function(val) {
		if (!arguments.length) return this.startX();
		this.startX(val);
		return this;
	},
	endAngle: function(val) {
		if (!arguments.length) return this.endX();
		this.endX(val);
		return this;
	},

	transformAngleRadiusToXY: function(angle, radius) {
		angle += -Math.PI / 2;
		return [radius * Math.cos(angle), radius * Math.sin(angle)];
	},

	translatePercentToRadius: function(scale, percent) {
		var range = dv.util.scaleRange(scale);
		var radius = Math.abs(range[1] - range[0]) / 2;
		return (radius - this.outerRadius() - this.innerRadius()) * percent + this.innerRadius();
	},
	translatePercentToTheta: function(scale, percent) {
		var degrees = (this.endAngle() - this.startAngle()) * percent + this.startAngle();
		return degrees * 0.017453293; // Math.PI / 180
	},

	text: function(xScale, yScale) {
		var self = this;

		function text(d, i) {
			var renderer = dv.svg.text.radial();

			if (!self._flip) {
				return renderer
					.angle(function(d, i) { return self.translatePercentToTheta(yScale, text.y()(d, i)); })
					.radius(function(d, i) { return self.translatePercentToRadius(xScale, text.x()(d, i)); });
			}
			else {
				return renderer
					.angle(function(d, i) { return self.translatePercentToTheta(xScale, text.x()(d, i)); })
					.radius(function(d, i) { return self.translatePercentToRadius(yScale, text.y()(d, i)); });
			}
		}

		text.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		text.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		return text;
	},


	point: function(xScale, yScale) {
		var self = this,
			point = {};

		point.renderer = dv.svg.symbol.radial()
			.angle(function(d, i) { return d.bounds.x; })
			.radius(function(d, i) { return d.bounds.y; });

		point.getBounds = function(d, i) {
			if (!point._defined(d, i)) return null;
			if (self._flip) {
				d.bounds = {
					x: self.translatePercentToTheta(xScale, point.y()(d, i)),
					y: self.translatePercentToRadius(yScale, point.x()(d, i))
				};
			}
			else {
				d.bounds = {
					x: self.translatePercentToTheta(xScale, point.x()(d, i)),
					y: self.translatePercentToRadius(yScale, point.y()(d, i))
				};	
			}
			return d;
		};

		point.getPath = function(obj) {
			return (obj === null) ? null : point.renderer(obj);
		};

		point.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		point.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		point.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return point;
	},

	line: function(xScale, yScale) {
		var self = this,
			line = {};

		line.renderer = d3.svg.line.radial()
				.angle(function(d, i) { return d.bounds.x; })
				.radius(function(d, i) { return d.bounds.y; });

		line.getBounds = function(seriesD, seriesI) {
			_.each(seriesD, function(d, i) {
				if (line._defined(d, i)) {
					if (self._flip) {
						d.bounds = {
							x: self.translatePercentToTheta(xScale, line.y()(d, i)),
							y: self.translatePercentToRadius(yScale, line.x()(d, i))
						};
					} else {
						d.bounds = {
							x: self.translatePercentToTheta(xScale, line.x()(d, i)),
							y: self.translatePercentToRadius(yScale, line.y()(d, i))
						};
					}
				}
				else {
					seriesD.splice(i, 1);
				}
			});
			return seriesD;
		};

		line.getPath = function(obj) {
			return (obj === null) ? null : line.renderer(obj);
		};

		line.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		line.y = function(val) {
			if (!arguments.length) return this._y;
			this._y = val;
			return this;
		};

		line.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return line;
	},

	area: function(xScale, yScale) {
		var self = this,
			area = {};

		area.renderer = d3.svg.area.radial();

		area.getBounds = function(seriesD, seriesI) {
			var sd = [];
			area.setupRenderer();
			_.each(seriesD, function(d, i) {
				if (area._defined(d, i)) {
					var newD = _.clone(d);
					if (self._flip) {
						newD.bounds = {
							x: self.translatePercentToRadius(yScale, area.x()(d, i)),
							y0: self.translatePercentToTheta(xScale, area.y0()(d, i)),
							y1: self.translatePercentToTheta(xScale, area.y1()(d, i))
						};
					} else {
						newD.bounds = {
							x: self.translatePercentToTheta(xScale, area.x()(d, i)),
							y0: self.translatePercentToRadius(yScale, area.y0()(d, i)),
							y1: self.translatePercentToRadius(yScale, area.y1()(d, i))
						};
					}
					sd.push(newD);
				}
			});
			return sd;
		};

		area.getPath = function(obj) {
			area.setupRenderer();
			return (obj === null) ? null : area.renderer(obj);
		};

		area.setupRenderer = function() {
			if (self._flip) {
				area.renderer.angle(null)
					.innerRadius(null)
					.outerRadius(null)
					.radius(function(d, i) { return d.bounds.x; })
					.startAngle(function(d, i) { return d.bounds.y0; })
					.endAngle(function(d, i) { return d.bounds.y1; });
			}
			else {
				area.renderer.radius(null)
					.startAngle(null)
					.endAngle(null)
					.angle(function(d, i) { return d.bounds.x; })
					.innerRadius(function(d, i) { return d.bounds.y0; })
					.outerRadius(function(d, i) { return d.bounds.y1; });
			}
		};

		area.x = function(val) {
			if (!arguments.length) return this._x;
			this._x = val;
			return this;
		};

		area.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		area.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		area.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return area;
	},

	rect: function(xScale, yScale) {
		var self = this,
			rect = {};

		rect.renderer = d3.svg.arc()
			.startAngle(function(d, i) { return d.bounds.x0; })
			.endAngle(function(d, i) { return d.bounds.x1; })
			.innerRadius(function(d, i) { return d.bounds.y0; })
			.outerRadius(function(d, i) { return d.bounds.y1; });

		rect.getBounds = function(d, i) {
			var newD = _.clone(d);
			if (!rect._defined(newD, i)) return null;
			if (self._flip) {
				newD.bounds = {
					x0: self.translatePercentToTheta(xScale, rect.x0()(newD, i)),
					x1: self.translatePercentToTheta(xScale, rect.x1()(newD, i)),
					y0: self.translatePercentToRadius(yScale, rect.y0()(newD, i)),
					y1: self.translatePercentToRadius(yScale, rect.y1()(newD, i))
				};
			} else {
				newD.bounds = {
					x0: self.translatePercentToTheta(yScale, rect.y0()(newD, i)),
					x1: self.translatePercentToTheta(yScale, rect.y1()(newD, i)),
					y0: self.translatePercentToRadius(xScale, rect.x0()(newD, i)),
					y1: self.translatePercentToRadius(xScale, rect.x1()(newD, i))
				};
			}
			return newD;
		},

		rect.getPath = function(obj) {
			return (obj === null) ? null : rect.renderer(obj);
		},

		rect.x0 = function(val) {
			if (!arguments.length) return this._x0;
			this._x0 = val;
			return this;
		};

		rect.x1 = function(val) {
			if (!arguments.length) return this._x1;
			this._x1 = val;
			return this;
		};

		rect.y0 = function(val) {
			if (!arguments.length) return this._y0;
			this._y0 = val;
			return this;
		};

		rect.y1 = function(val) {
			if (!arguments.length) return this._y1;
			this._y1 = val;
			return this;
		};

		rect.defined = function(val) {
			if (!arguments.length) return this._defined;
			this._defined = val;
			return this;
		};

		return rect;
	}
});
dv.guide = dv.extend({
	init: function() {
		this._renderer = null;
	},
	
	scale: function(val) {
		if (!arguments.length) return this._scale;
		this._scale = val;
		return this;
	},

	orientation: function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	},

	render: function(p, bounds) {
		// Default render function
	},

	chart: function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		return this;
	},

	title: function(val) {
		if (!arguments.length) return this._title;
		this._title = val;
		return this;
	},

	getPlotBounds: function(bounds) {
		return bounds;
	}
});
dv.guide.axis = dv.guide.extend({
	init: function() {
		this._ticks = 5;
		this._tickInterval = undefined;
		this._minorTickSize = 10;
		this._labelGroup = null;
	},
	render: function(p, labelContainer, bounds) {
		if (!this._scale) return;
		var axisOffset = this._getAxisOffset(bounds);
		var labelGroup = this._constructLabelGroup(labelContainer, axisOffset);
		var d3Axis = this._constructD3Axis(labelGroup, bounds);
		this._renderAxis(p, bounds, axisOffset, d3Axis, labelGroup);

		return this;
	},

	_constructLabelGroup: function(labelContainer, axisOffset) {
		var labelGroup = labelContainer.select(".axis-" + this._scale.property());
		if (labelGroup.empty()) {
			labelGroup = labelContainer.append('g')
				.classed('axis-' + this._scale.property(), true);
		}
		labelGroup.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')');
		return labelGroup;
	},

	_getAxisOffset: function(bounds) {
		return [
			this._orientation === "right" ? bounds.right : bounds.left,
			this._orientation === "bottom" ? bounds.bottom : bounds.top
		];
	},

	_constructD3Axis: function(labelGroup, bounds) {
		var size = _.isUndefined(this._tickSize) ? this.getDefaultTickSize(bounds) : this._tickSize,
			orient; // In D3, orient refers to how labels are aligned.

		if (this._orientation === "left") orient = "right";
		if (this._orientation === "right") orient = "left";
		if (this._orientation === "top") orient = "bottom";
		if (this._orientation === "bottom") orient = "top";

		if (this._scale.property() === "x") {
			var range = dv.util.scaleRange(this._scale);
			range[0] += this._chart.coord().startX();
			range[1] -= this._chart.coord().endX();
			if (this._scale instanceof dv.scale.ordinal) {
				this._scale.rangeBands(range);
			}
			else {
				this._scale.range(range);
			}
		}

		return dv.svg.axis()
			.orient(orient)
			.ticks(_.isUndefined(this._ticks) ? 5 : this._ticks, this._tickInterval)
			.tickSize(size, this._minorTickSize, size)
			.tickPadding(_.isUndefined(this._tickPadding) ? this.getDefaultTickPadding(bounds) : this._tickPadding)
			.tickFormat(_.isUndefined(this._tickFormat) && this._chart.position() === "fill" && this._scale.property() === "y" ? dv_percent_tick_format : this._tickFormat)
			.tickValues(this._tickValues)
			.tickSubdivide(this._tickSubdivide)
			.scale(this._scale._d3Scale);
	},

	_renderAxis: function(p, bounds, axisOffset, d3Axis, labelGroup) {
		var self = this,
			axis = p.select('.axis-' + this._scale.property()),
			axisBounds = this._measureAxis(p, axisOffset, d3Axis);

		d3Axis.labelContainer(labelGroup);

		if (axis.empty()) {
			axis = p.append('g')
				.classed('axis-' + this._scale.property(), true);
		}

		this._renderAxisTitle(bounds, axis, axisBounds);

		if (!this._chart._firstRender && dv.ANIMATION) {
			axis = axis.transition()
				.delay(this.chart().delay())
				.duration(this.chart().duration())
				.ease(this.chart().ease());
		}
		
		axis.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')')
			.call(d3Axis);
	},

	// render the axis as it should be on an invisible group, then measure it and immediately remove it.
	_measureAxis: function(p, axisOffset, d3Axis) {
		var tempParent = p.append('g').classed('temp-axis', true),
			bounds;

		d3Axis.labelContainer(tempParent);
		tempParent.attr('transform', 'translate(' + axisOffset[0] + ',' + axisOffset[1] + ')').call(d3Axis);
		bounds = tempParent.node().getBBox();

		// Our measuring is done, let's trash this container
		tempParent.remove();
		return bounds;
	},

	_renderAxisTitle: function(bounds, axis, axisBounds) {
		var self = this,
			rotation = 0,
			titlePadding = 8,
			newTitle = false,
			axisTitle,
			x, y; 

		axisTitle = axis.selectAll(".axis-title");
		if (axisTitle.empty()) {
			axisTitle = axis.append("text")
				.classed("axis-title", true)
				.style("text-anchor", "middle");

			if (dv.ANIMATION) {
				axisTitle.style("opacity", 0);
			}
				
			newTitle = true;
		}
		axisTitle.text(this._title);
		axisTitleBounds = axisTitle.node().getBBox();

		switch(this._titleOrientation || this._orientation) {
			case "top" :
				x = (bounds.right - bounds.left) / 2;
				y = axisBounds.y - titlePadding;
				break;
			case "right" :
				x = -(bounds.top - bounds.bottom) / 2;
				y = (axisBounds.x + axisBounds.width + titlePadding) * -1;
				rotation = 90;
				break;
			case "bottom" :
				x = (bounds.right - bounds.left) / 2;
				y = axisBounds.y + axisBounds.height + (axisTitleBounds.height / 2) + titlePadding;
				break;
			case "left" :
				x = (bounds.top - bounds.bottom) / 2;
				y = axisBounds.x - titlePadding;
				rotation = 270;
				break;
		}

		axisTitle.attr("transform", "rotate(" + rotation + " 0,0)");
		
		if (dv.ANIMATION) {
			axisTitle = axisTitle.transition()
				.delay(this.chart().delay())
				.duration(this.chart().duration())
				.ease(this.chart().ease());
		}

		axisTitle.attr("x", x).attr("y", y);

		if (dv.ANIMATION) {
			axisTitle.each("end.transition", function(d, i) {
				// If the title is brand new, we'll fade it in after everything is drawn.
				// It looks a little odd when both titles are flying in from (0, 0), so if
				// they are hidden and we wait until they arrive at their final destination,
				// we can fade them in and it looks better. On subsequent updates, it's ok
				// to move them from their old to their new positions.
				if (newTitle) {
					d3.select(this)
						.transition()
						.duration((self.chart().duration()() === 0) ? 0 : 500)
						.style("opacity", 1);
				}
			});
		}
	},

	getDefaultTickSize: function(bounds) {
		if (this._orientation === 'bottom') {
			return bounds.bottom - bounds.top;
		}
		else if (this._orientation === 'left') {
			return bounds.right - bounds.left;
		}
		else if (this._orientation === 'top') {
			return bounds.bottom - bounds.top;
		}
		else { // right
			return bounds.right - bounds.left;
		}
	},

	getDefaultTickPadding: function(bounds) {
		if (this._orientation === "bottom" || this._orientation === "top") {
			return bounds.top - bounds.bottom + 15;
		}
		return bounds.left - bounds.right + 10;
	},

	ticks: function(arg1, arg2) {
		if (!arguments.length) return _.isFinite(this._tickInterval) ? [this._ticks, this._tickInterval] : this._ticks;
		this._ticks = arg1;
		this._tickInterval = arg2;
		return this;
	},

	tickSubdivide: function(val) {
		if (!arguments.length) return this._tickSubdivide;
		this._tickSubdivide = val;
		return this;
	},

	tickSize: function(val) {
		if (!arguments.length) return this._tickSize;
		this._tickSize = val;
		return this;
	},

	minorTickSize: function(val) {
		if (!arguments.length) return this._minorTickSize;
		this._minorTickSize = val;
		return this;
	},

	tickPadding: function(val) {
		if (!arguments.length) return this._tickPadding;
		this._tickPadding = val;
		return this;
	},

	tickFormat: function(val) {
		if (!arguments.length) return this._tickFormat ? this._tickFormat : this._scale._d3Scale.tickFormat(0);
		this._tickFormat = val;
		return this;
	},

	tickValues: function(val) {
		if (!arguments.length) return this._tickValues;
		this._tickValues = val;
		return this;
	},

	titleOrientation: function(val) {
		if (!arguments.length) return this._titleOrientation;
		this._titleOrientation = val;
		return this;
	}
});

function dv_percent_tick_format(val, index) {
	return val + "%";
}



dv.svg.axis = function() {
	var scale = d3.scale.linear(),
		orient = "bottom",
		tickMajorSize = 6,
		tickMinorSize = 6,
		tickEndSize = 6,
		tickPadding = 3,
		tickArguments_ = [10],
		tickValues = null,
		tickFormat_,
		tickSubdivide = 0,
		labelContainer;

	function axis(g) {
		g.each(function() {
			var g = d3.select(this);

			// Ticks, or domain values for ordinal scales.
			var ticks = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain()) : tickValues,
				tickFormat = tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String) : tickFormat_;

			// Minor ticks.
			var subticks = d3_svg_axisSubdivide(scale, ticks, tickSubdivide),
				subtick = g.selectAll(".minor").data(subticks, String),
				subtickEnter = subtick.enter().insert("line", "g").attr("class", "tick minor").style("opacity", 1e-6),
				subtickExit = d3.transition(subtick.exit()).style("opacity", 1e-6).remove(),
				subtickUpdate = d3.transition(subtick).style("opacity", 1);

			// Major ticks.
			var tick = g.selectAll(".axis-tick").data(ticks, String),
				tickEnter = tick.enter().insert("g", "path").classed("axis-tick", true).style("opacity", 1e-6),
				tickExit = d3.transition(tick.exit()).style("opacity", 1e-6).remove(),
				tickUpdate = d3.transition(tick).style("opacity", 1),
				tickTransform;

			// Labels
			var label = labelContainer.selectAll(".axis-label-group").data(ticks, String),
				labelEnter = label.enter().append("g").classed("axis-label-group", true).style("pointer-events", "none").style("opacity", 1e-6),
				labelExit = d3.transition(label.exit()).style("opacity", 1e-6).remove(),
				labelUpdate = d3.transition(label).style("opacity", 1);

			// Domain.
			var range = dv.util.scaleRangeNoReverse(scale),
				path = g.selectAll(".domain").data([0]),
				pathEnter = path.enter().append("path").attr("class", "domain"),
				pathUpdate = d3.transition(path);

			// Stash a snapshot of the new scale, and retrieve the old snapshot.
			var scale1 = scale.copy(),
				scale0 = this.__chart__ || scale1;
			this.__chart__ = scale1;

			tickEnter.append("line").attr("class", "tick");
			labelEnter.append("text").classed("text-shadow", true);
			labelEnter.append("text").classed("axis-label", true);

			var lineEnter = tickEnter.select("line"),
				lineUpdate = tickUpdate.select("line"),
				text = label.select(".axis-label").text(tickFormat),
				textEnter = labelEnter.select(".axis-label"),
				textUpdate = labelUpdate.select(".axis-label"),
				textShadow = label.select(".text-shadow").text(tickFormat),
				textShadowEnter = labelEnter.select(".text-shadow"),
				textShadowUpdate = labelUpdate.select(".text-shadow");

			switch (orient) {
				case "bottom": {
					tickTransform = d3_svg_axisX;
					subtickEnter.attr("y2", tickMinorSize);
					subtickUpdate.attr("x2", 0).attr("y2", tickMinorSize);
					lineEnter.attr("y2", tickMajorSize);
					lineUpdate.attr("x2", 0).attr("y2", tickMajorSize);
					pathUpdate.attr("d", "M" + range[0] + "," + tickEndSize + "V0H" + range[1] + "V" + tickEndSize);

					textEnter.attr("y", Math.max(tickMajorSize, 0) + tickPadding);
					textUpdate.attr("x", 0).attr("y", Math.max(tickMajorSize, 0) + tickPadding);
					text.attr("dy", ".71em").attr("text-anchor", "middle");

					textShadowEnter.attr("y", Math.max(tickMajorSize, 0) + tickPadding);
					textShadowUpdate.attr("x", 0).attr("y", Math.max(tickMajorSize, 0) + tickPadding);
					textShadow.attr("dy", ".71em").attr("text-anchor", "middle");
					
					break;
				}
				case "top": {
					tickTransform = d3_svg_axisX;
					subtickEnter.attr("y2", -tickMinorSize);
					subtickUpdate.attr("x2", 0).attr("y2", -tickMinorSize);
					lineEnter.attr("y2", -tickMajorSize);
					lineUpdate.attr("x2", 0).attr("y2", -tickMajorSize);
					pathUpdate.attr("d", "M" + range[0] + "," + -tickEndSize + "V0H" + range[1] + "V" + -tickEndSize);

					textEnter.attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
					textUpdate.attr("x", 0).attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
					text.attr("dy", "0em").attr("text-anchor", "middle");

					textShadowEnter.attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
					textShadowUpdate.attr("x", 0).attr("y", -(Math.max(tickMajorSize, 0) + tickPadding));
					textShadow.attr("dy", "0em").attr("text-anchor", "middle");
					
					break;
				}
				case "left": {
					tickTransform = d3_svg_axisY;
					subtickEnter.attr("x2", -tickMinorSize);
					subtickUpdate.attr("x2", -tickMinorSize).attr("y2", 0);
					lineEnter.attr("x2", -tickMajorSize);
					lineUpdate.attr("x2", -tickMajorSize).attr("y2", 0);
					pathUpdate.attr("d", "M" + -tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + -tickEndSize);

					textEnter.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding));
					textUpdate.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding)).attr("y", 0);
					text.attr("dy", ".32em").attr("text-anchor", "end");
					
					textShadowEnter.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding));
					textShadowUpdate.attr("x", -(Math.max(tickMajorSize, 0) + tickPadding)).attr("y", 0);
					textShadow.attr("dy", ".32em").attr("text-anchor", "end");
					
					break;
				}
				case "right": {
					tickTransform = d3_svg_axisY;
					subtickEnter.attr("x2", tickMinorSize);
					subtickUpdate.attr("x2", tickMinorSize).attr("y2", 0);
					lineEnter.attr("x2", tickMajorSize);
					lineUpdate.attr("x2", tickMajorSize).attr("y2", 0);
					pathUpdate.attr("d", "M" + tickEndSize + "," + range[0] + "H0V" + range[1] + "H" + tickEndSize);

					textEnter.attr("x", Math.max(tickMajorSize, 0) + tickPadding);
					textUpdate.attr("x", Math.max(tickMajorSize, 0) + tickPadding).attr("y", 0);
					text.attr("dy", ".32em").attr("text-anchor", "start");

					textShadowEnter.attr("x", Math.max(tickMajorSize, 0) + tickPadding);
					textShadowUpdate.attr("x", Math.max(tickMajorSize, 0) + tickPadding).attr("y", 0);
					textShadow.attr("dy", ".32em").attr("text-anchor", "start");
					
					break;
				}
			}

			// For quantitative scales:
			// - enter new ticks from the old scale
			// - exit old ticks to the new scale
			if (scale.ticks) {
				tickEnter.call(tickTransform, scale0);
				labelEnter.call(tickTransform, scale0);
				tickUpdate.call(tickTransform, scale1);
				labelUpdate.call(tickTransform, scale1);
				tickExit.call(tickTransform, scale1);
				labelExit.call(tickTransform, scale1);
				subtickEnter.call(tickTransform, scale0);
				subtickUpdate.call(tickTransform, scale1);
				subtickExit.call(tickTransform, scale1);
			}

			// For ordinal scales:
			// - any entering ticks are undefined in the old scale
			// - any exiting ticks are undefined in the new scale
			// Therefore, we only need to transition updating ticks.
			else {
				var dx = scale1.rangeBand() / 2, x = function(d) { return scale1(d) + dx; };
				tickEnter.call(tickTransform, x);
				labelEnter.call(tickTransform, x);
				tickUpdate.call(tickTransform, x);
				labelUpdate.call(tickTransform, x);
			}
		});
	}

	axis.scale = function(x) {
		if (!arguments.length) return scale;
		scale = x;
		return axis;
	};

	axis.orient = function(x) {
		if (!arguments.length) return orient;
		orient = x;
		return axis;
	};

	axis.ticks = function() {
		if (!arguments.length) return tickArguments_;
		tickArguments_ = arguments;
		return axis;
	};

	axis.tickValues = function(x) {
		if (!arguments.length) return tickValues;
		tickValues = x;
		return axis;
	};

	axis.tickFormat = function(x) {
		if (!arguments.length) return tickFormat_;
		tickFormat_ = x;
		return axis;
	};

	axis.tickSize = function(x, y, z) {
		if (!arguments.length) return tickMajorSize;
		var n = arguments.length - 1;
		tickMajorSize = +x;
		tickMinorSize = n > 1 ? +y : tickMajorSize;
		tickEndSize = n > 0 ? +arguments[n] : tickMajorSize;
		return axis;
	};

	axis.tickPadding = function(x) {
		if (!arguments.length) return tickPadding;
		tickPadding = +x;
		return axis;
	};

	axis.tickSubdivide = function(x) {
		if (!arguments.length) return tickSubdivide;
		tickSubdivide = +x;
		return axis;
	};

	axis.labelContainer = function(x) {
		if (!arguments.length) return labelContainer;
		labelContainer = x;
		return axis;
	};

	return axis;
};

function d3_svg_axisX(selection, x) {
	selection.attr("transform", function(d) { return "translate(" + x(d) + ",0)"; });
}

function d3_svg_axisY(selection, y) {
	selection.attr("transform", function(d) { return "translate(0," + y(d) + ")"; });
}

function d3_svg_axisSubdivide(scale, ticks, m) {
	subticks = [];
	if (m && ticks.length > 1) {
		var extent = dv.util.scaleExtent(scale.domain()),
			subticks,
			i = -1,
			n = ticks.length,
			d = (ticks[1] - ticks[0]) / ++m,
			j,
			v;
		while (++i < n) {
			for (j = m; --j > 0;) {
				if ((v = +ticks[i] - j * d) >= extent[0]) {
					subticks.push(v);
				}
			}
		}
		for (--i, j = 0; ++j < m && (v = +ticks[i] + j * d) < extent[1];) {
			subticks.push(v);
		}
	}
	return subticks;
}

dv.guide.legend = dv.guide.extend({
	init: function() {
		this._overlay = false;
		this._orientation = "right";
		this._vGap = 10;
		this._hGap = 10;
		this._defaultPadding = this._padding = {"top": 0, "left": 10, "right": 0, "bottom": 0};
	},
	render: function(p, bounds, data) {
		var pTransition = p;

		this._data = data;
		this._transformData = [];
		this._width = bounds.right - bounds.left;
		this._height = bounds.bottom - bounds.top;

		this._bounds = this._measureLegend(p, bounds);


		if (!this._chart._firstRender) {
			pTransition = p.transition()
				.duration(this.chart().duration())
				.delay(this.chart().delay())
				.ease(this.chart().ease())
				.style("opacity", 1);
		}
		pTransition.attr('transform', 'translate(' + (this._bounds.left) + ',' + (this._bounds.top) + ')');
			this._renderLegend(p, false);

		if (this._chart._firstRender) {
			pTransition.transition()
				.duration(this.chart().duration())
				.style("opacity", 1);
		}
	},

	_measureLegend: function(p, bounds) {
		var tmp = p.append("g").classed("temp-legend", true),
			d = [];
		this._renderLegend(tmp, true);

		var bBox = tmp.node().getBBox();
		if (this._isVAligned()) {
			this._width = bBox.width;
		}
		else {
			this._height = bBox.height;
		}

		var b = {
			left: ((this._orientation === "right") ? bounds.right - this._padding.right - this._width : bounds.left + this._padding.left),
			right: ((this._orientation === "left") ? bounds.left + this._padding.left + this._width : bounds.right - this._padding.right),
			top: ((this._orientation === "bottom") ? bounds.bottom - this._padding.bottom - this._height : bounds.top + this._padding.top),
			bottom: ((this._orientation === "top") ? bounds.top + this._padding.top + this._height : bounds.bottom - this._padding.bottom)
		};

		tmp.remove();

		return b;
		
	},

	_renderLegend: function(p, calc) {
		var self = this,
			domain = [],
			entryWidths = [];
		for (var prop in this._data) {
			domain = this._data[prop].domain();
			break;
		}
		
		var entries = p.selectAll(".legend-entry")
			.data(domain);

		entries.exit()
			.transition()
				.duration(this._chart.duration())
				.style("opacity", 0)
				.remove();

		var entry = entries.enter()
			.append('g')
			.classed('legend-entry', true);

		entry.append('path');
		entry.append('text')
			.classed('legend-entry-label', true);
		entry.append('text')
			.classed('legend-entry-value', true);

		entries.select("path")
			.attr("d", function(d, i) { return self.getPath.call(this, d, i, self); })
			.call(self.addAttributes, self)
			.each(function(d, i) {
				entryWidths[i] = this.getBBox().width + 10;
			});
		entries.select("text.legend-entry-label")
			.attr("x", 20)
			.attr("y", 10)
			.text(function(d, i) {
				if (_.isUndefined(self._labels)) return d;
				else return self._labels[i % self._labels.length];
			})
			.each(function(d, i) {
				entryWidths[i] += this.getBBox().width;
			});

		entries.select("text.legend-entry-value")
			.attr("y", 10)
			.attr("x", function(d, i) {
				return entryWidths[i];
			})
			.text(function(d, i) {
				if (_.isUndefined(self._values)) return "";
				else return self._values[i];
			})
			.style("fill", function(d, i) {
				if (!_.isUndefined(self._data["stroke"])) return self._data["stroke"].mapValue(d);
				else if (!_.isUndefined(self._data["fill"])) return self._data["fill"].mapValue(d);
				return;
			});

		var xCursor = 0,
			yCursor = 0,
			sibling = null;

		entries.each(function(d, i) {
			var el = d3.select(this);
			if(calc) {
				el.attr("transform", function() {
					var b;
					if (self._isVAligned()) {
						if (sibling) {
							yCursor += sibling.getBBox().height + self._vGap;
						}
						if ((yCursor + this.getBBox().height + self._padding.bottom) > self._height) {
							yCursor = 0;
							xCursor = this.parentNode.getBBox().width + self._hGap;
						}
					} else {
						if (sibling) {
							xCursor += sibling.getBBox().width + self._hGap;
						}
						if ((xCursor + this.getBBox().width + self._padding.right) > self._width) {
							xCursor = 0;
							yCursor = this.parentNode.getBBox().height + self._vGap;
						}
					}
					self._transformData[i] = { x : xCursor, y: yCursor };
					return "translate(" + self._transformData[i].x + ", " + self._transformData[i].y + ")";
				});
				sibling = el.node();
			} else {
				if (dv.ANIMATION) {
					el = el.transition()
						.duration(self._chart.duration());
				}
				el.attr("transform", "translate(" + self._transformData[i].x + ", " + self._transformData[i].y + ")");
			}
		});
//		entries.attr("transform", function(d, i) { return self._calcEntryTransform.call(this, d, i, self, entries.node()); });
	},

	getPath: function(d, i, self) {
		var swatchWidth = 15,
			swatchHeight = 10;

		if (self._data.hasOwnProperty("fill"))
			return self.drawRect(0, 0, swatchWidth, swatchHeight);
		else
			return self.drawLine(0, 0, swatchWidth, swatchHeight);
	},

	addAttributes: function(selection, self) {
		selection.attr("style", "");
		if (self._data.hasOwnProperty("fill"))
			selection.style("fill", function(d, i) { return self._data["fill"].mapValue(d); });
		if (self._data.hasOwnProperty("stroke"))
			selection.style("stroke", function(d, i) { return self._data["stroke"].mapValue(d); })
				.style("stroke-width", 2);
		if (self._data.hasOwnProperty("linetype")) {
			selection.style('stroke-dasharray', function(d, i) { return dv.util.svg.getDasharray(self._data["linetype"].mapValue(d)); });
			if (!self._data.hasOwnProperty("stroke")) selection.style("stroke", "#000");
			selection.style("stroke-width", 2);
		}
		if (self._data.hasOwnProperty("size")) {
			selection.style("stroke-width", function(d, i) {
				return self._data["size"].mapValue(d);
			});
		}
	},

	getPlotBounds: function(bounds) {
		if (this._overlay) return bounds;
		return {
			left: (this._orientation === "left") ? this._bounds.right + this._padding.right : bounds.left,
			right: (this._orientation === "right") ? this._bounds.left - this._padding.left : bounds.right,
			top: (this._orientation === "top") ? this._bounds.bottom + this._padding.bottom : bounds.top,
			bottom: (this._orientation === "bottom") ? this._bounds.top  - this._padding.top : bounds.bottom
		};
	},

	drawRect: function(x, y, w, h) {
		return "M" + x + "," + y +
			"L" + (x + w) + "," + y +
			"L" + (x + w) + "," + (y + h) +
			"L" + x + "," + (y + h) + "Z";
	},

	drawLine: function(x0, y0, x1, y1) {
		return "M" + x0 + "," + y0 +
			"L" + x1 + "," + y1;
	},
	_isVAligned: function() {
		return (this._orientation === "left" || this._orientation === "right");
	},
	vGap: function(val) {
		if (!arguments.length) return this._vGap;
		this._vGap = val;
		return this;
	},
	hGap: function(val) {
		if (!arguments.length) return this._hGap;
		this._hGap = val;
		return this;
	},
	padding: function(val) {
		if (!arguments.length) return this._padding;
		this._padding = dv.util.merge(this._defaultPadding, val);
		return this;
	},
	align: function(val) {
		if (!arguments.length) return this._align;
		this._align = val;
		return this;
	},
	labels: function(val) {
		if (!arguments.length) return this._labels;
		this._labels = val;
		return this;
	},
	values: function(val) {
		if (!arguments.length) return this._values;
		this._values = val;
		return this;
	},
	overlay: function(val) {
		if (!arguments.length) return this._overlay;
		this._overlay = val;
		return this;
	},
	bounds: function() {
		return this._bounds;
	}
});

var swatches = {
	"rect": "M"
};
dv.guide.custom = dv.guide.extend({
	init: function(renderer) {
		this.render = renderer;
	},
	// Setter only
	renderer: function(val) {
		this.render = val;
		return this;
	}
});
dv.geom = dv.container.extend({
	
	init: function() {
		this._super();
		this._defaultAes = {};
		this._behaviorsLayer = null;

		this._initializeDefaultAes();
	},

	_initializeDefaultAes:function() {
		this._defaultAes['x'] = 1;
		this._defaultAes['y'] = 1;
		this._defaultAes['stroke'] = '#666';
		this._defaultAes['fill'] = '#666';
		this._defaultAes['alpha'] = 1.0;
		this._defaultAes['shape'] = 'circle';
		this._defaultAes['size'] = 2;
		this._defaultAes['linetype'] = 'solid';
	},

	_default: function(property, val) {
		this._defaultAes[property] = dv.scale.constant().value(val).property(property);
		return this;
	},

	_prerender: function(chart) {
		this._chart = chart;
		var _normalizedData = this._normalizeData(this.data());
		this.normalizedData(_normalizedData);

		this._calculateStats();

		var zipData = dv.util.filterAndZip(_normalizedData);

		var group = this.getScale('group');
		var groupMapping;

		if (group) {
			groupMapping = group.property();
		}

		if (groupMapping) {
			var groupKeys = _normalizedData[groupMapping];

			this._nestData = d3.nest()
				.key(function(d) { return d[groupMapping]; })
				.sortKeys(function(a, b) { // Ensure sort order is maintained.
					var bIndex = groupKeys.indexOf(b),
						aIndex = groupKeys.indexOf(a);
					if (aIndex < 0) aIndex = groupKeys.indexOf(Number(a)); // The key was a number perhaps?
					if (bIndex < 0) bIndex = groupKeys.indexOf(Number(b));
					return bIndex < aIndex ? 1 : -1;
				})
				.entries(zipData);
		} else {
			this._nestData = [{ 'key': undefined, 'values': zipData }];
		}

		this._calculateStats();
		this._handlePositions();
		for(var prop in chart._aes) {
			if(chart._aes.hasOwnProperty(prop) && !this._aes.hasOwnProperty(prop)) {
				this._aes[prop] = chart._aes[prop];
			}
		}
		this._trainScales();
	},

	_trainScales: function() {
		for (var property in this._aes) {
			if (this._aes.hasOwnProperty(property) && !(this.getScale(property) instanceof dv.scale.constant)) {
				var stack = this.position() === "stack",
					fill = this.position() === "fill",
					options = {
						stack: stack && property === "y",
						fill: fill && property === "y"
					},
					trainedScale = this.getTrainedScale(property);

				if (!trainedScale) {
					trainedScale = this._aes[property].copy();
					this._chart._trainedScales[property] = trainedScale;
					trainedScale.trainDomain(this._nestData, options);
				}
				else {
					var scale = this._aes[property];
					trainedScale.unionDomain(scale.calculateDomain(this._nestData, options), scale.reverse());
				}
			}
		}
	},

	render: function(geomGroup) {
		this._geomGroup = d3.select(geomGroup);

		var seriesGroups = this._geomGroup
			.selectAll('.series')
			.data(this._nestData);

		seriesGroups.exit()
			.call(this.exitSeriesGroup, this);

		seriesGroups.enter()
			.append('g')
			.classed('series', true);

		seriesGroups.call(this.updateGroups, this.enterPen, this.pen, this.enterPen, this)
			.call(this.updateDataPoints, this.enterPen, this.pen, this.enterPen, this);

		this._renderBehaviors(this._geomGroup);

		// Clean up our geom events.  They should have all been removed by now.
		self.unregisterEventMap = null;
	},

	_renderBehaviors: function(geomGroup) {
		var self = this;
		if (this._behaviors && this._behaviors.length) {
			this._behaviorsLayer = geomGroup.select('.behavior-layer');

			if (this._behaviorsLayer.empty()) {
				this._behaviorsLayer = geomGroup.append('g')
					.classed("behavior-layer", true);
			} else {
				this._behaviorsLayer.node().parentNode.appendChild(this._behaviorsLayer.node());
			}

			_.each(this._behaviors, function(behavior) {
				behavior.geom(self).render(self._behaviorsLayer);
			});
		}
	},

	updateGroups: function(seriesGroups, enterPen, pen, exitPen, self) {
		var x = 0,
			y = 0;

		if (self._chart._coord instanceof dv.coord.polar) {
			var xRange = dv.util.scaleRange(self.getScale('x')),
				yRange = dv.util.scaleRange(self.getScale('y'));
					
			x = (xRange[0] + xRange[1]) / 2;
			y = (yRange[0] + yRange[1]) / 2;
		}
		
		seriesGroups
			.attr("transform", 'translate(' + x + ',' + y + ')');
	},

	updateDataPoints: function(seriesGroups, enterPen, pen, exitPen, self) {
		var alphaScale = self.getScale('alpha');

		seriesGroups.each(function (p, j) {
			var seriesGroup = d3.select(this);
			var _enterPen = enterPen.call(self, j);
			var _updatePen = pen.call(self, j);
			var _exitPen = exitPen.call(self, j);

			var nodes = seriesGroup.selectAll('.' + self.dataPointStyleClass)
				.data(self.getValues(p));

			nodes.exit()
				//.attr('d', _updatePen)
				.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease())
					.each(function() { this.__exiting__ = true; })
					//.style('opacity', 1e-6)
					.attrTween('d', _exitPen.pathTween)
					.remove();

			nodes.enter()
				.append('path') // TODO: This base class shouldn't contain a reference to svg:path.  That should be broken out to another object and used via composition.
					.each(function(d, i) { self.setPreviousState.call(this, _enterPen, _exitPen, d, i); })
					.attr("class", function(d, i) { return "datum-" + i + " series-" + j; })
					.call(self.attributes, self)
					//.style('opacity', 1e-6)
					.attr('d', _enterPen.path);

			var updateTransition = nodes.call(self.attributes, self)
				.call(self._removeRegisteredEvents, self)
				.call(self._addRegisteredEvents, self);

			if (dv.ANIMATION) {
				updateTransition = updateTransition.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease())
					.attrTween('d', _updatePen.pathTween);
			} else {
				updateTransition.attr('d', _updatePen.path);
			}
			
			updateTransition
				//.style('opacity', function(d, i) { return alphaScale.map(d[0], i); })
				.call(self.addEachFunction, self, j);
		});
	},

	addEachFunction: function(selection, self, seriesIndex) {
		if (self._each) {
			if (!_.isUndefined(self._each["start"])) {
				if (dv.ANIMATION) {
					selection.each("start", function(d, i) {
						self._each["start"].call(this, d, i, seriesIndex);
					});
				} else {
					selection.each(function(d, i) {
						self._each["start"].call(this, d, i, seriesIndex);
					});
				}
			}

			if (!_.isUndefined(self._each["end"])) {
				if (dv.ANIMATION) {
					selection.each("end", function(d, i) {
						self._each["end"].call(this, d, i, seriesIndex);
					});
				} else {
					selection.each(function(d, i) {
						self._each["end"].call(this, d, i, seriesIndex);
					});
				}
			}
		}
	},

	exitSeriesGroup: function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	},

	setPreviousState: function(enterPen, exitPen, d, i) {
		var bounds = enterPen.bounds(d, i);
		this.__previousBounds__ = bounds;
		this.__exitTransition__ = exitPen;
	},

	pathTween: function(pathRenderer, selection, d, i, j) {
		var path;
		if (selection.__exiting__) {
			path = selection.__exitTransition__.path(d, i);
			var temp = pathRenderer.getPath(pathRenderer.getBounds(d, i));
			selection.__exiting__ = false;
		}
		else {
			path = pathRenderer.getPath(pathRenderer.getBounds(d, i));
		}
		if (path === null) return null; // Make sure there is no "d" attribute.
		return d3.interpolate(d3.select(selection).attr("d"), path);
	},

	_calculateStats: function() {
	},

	_handlePositions: function() {
		var xScale = this.getScale('x');
		var yScale = this.getScale('y');
		if (this.position() == 'stack') {
			d3.layout.stack()
				.x(function(d, i) { return d[xScale.property()]; })
				.y(function(d, i) { return d[yScale.property()]; })
				(_.pluck(this._nestData, 'values'));
		} else if (this.position() === 'fill') {
			d3.layout.stack()
				.x(function(d, i) { return d[xScale.property()]; })
				.y(function(d, i) { return d[yScale.property()]; })
				.offset('expand')
				(_.pluck(this._nestData, 'values'));
		}
	},

	exit: function(geomGroup) {
		d3.select(geomGroup)
			.selectAll('.series')
				.call(this.exitSeriesGroup, this);
	},

	exitSeries: function(seriesGroups, exitPen, self) {
		seriesGroups.each(function(p, j) {
			var seriesGroup = d3.select(this);

			seriesGroup.selectAll('.' + self.dataPointStyleClass)
				.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease())
					.each(function() { this.__exiting__ = true; })
					.attrTween('d', exitPen.call(self, j).pathTween)
					.remove()
					.each("end", function(d, i) {
						var seriesGroupNode = seriesGroup.node();
						if (seriesGroupNode && seriesGroupNode.childNodes && !seriesGroupNode.childNodes.length) {
							// Is the geom container empty now too?
							var geomNode = seriesGroupNode.parentNode;
							if (geomNode && geomNode.childNodes && geomNode.childNodes.length <= 1) {
								d3.select(geomNode).remove();
							} else {
								seriesGroup.remove();
							}
						}
					});
		});
	},

	coord: function() {
		return this.chart().coord();
	},
	
	_addRegisteredEvents: function(nodes, self) {
		if (!self) self = this;
		if (!self._geomGroup) return;

		nodes = (!nodes ? self._geomGroup.selectAll('.' + this.dataPointStyleClass) : nodes);
		self = self || this;
		_.each(self.eventMap, function(e, type) {
			nodes.on(type, function(d, i) { // intercept the event and add our own parameters...
					self.eventMap[type].callback.call(this, d, i, d3.event);
				}, e.capture);
		});
		_.each(self._chart.eventMap, function(e, type) {
			nodes.on(type + ".dvchart", function(d, i) {
					var e = d3.event,
						interactionGroup = self._chart._interactionGroup.node();
					
					if (self._shouldDispatchChartEvent(e, interactionGroup)) {
						self._chart.eventMap[type].callback.call(interactionGroup, e);
					}
				}, e.capture);
		});

		// Forward this event on to the behaviors
		_.each(self._behaviors, function(behavior) {
			if (behavior._addRegisteredEvents) behavior._addRegisteredEvents();
		});
	},

	_removeRegisteredEvents: function(nodes, self) {
		if (!self) self = this;
		if (!self._geomGroup) return;

		nodes = nodes || self._geomGroup.selectAll('.' + this.dataPointStyleClass);
		self = self || this;
		_.each(self.unregisterEventMap, function(capture, type) {
			nodes.on(type, null, capture);
		});
		_.each(self._chart.unregisterEventMap, function(capture, type) {
			nodes.on(type + ".dvchart", null, capture);
		});

		// Forward this event on to the behaviors
		_.each(self._behaviors, function(behavior) {
			if (behavior._removeRegisteredEvents) behavior._removeRegisteredEvents();
		});
	},

	_shouldDispatchChartEvent: function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out/over events when rolling over geoms contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var rTarg = e.relatedTarget;
			if (!rTarg) 
				rTarg = (e.type === "mouseout") ? e.toElement : e.fromElement;

			var relTarget = d3.select(rTarg);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !((relTarget.node() === interactionGroup) || (className && className.indexOf('-geom') >= 0));
			}
		}
		return result;
	},
	
	getExplicitScalesMap: function() {
		var chartAesMap = _.clone(this._chart.getExplicitScalesMap());
		var combinedMap = _.extend(chartAesMap, this._aes);
		return combinedMap;
	},

	getExplicitScale: function(property) {
		if (this._aes.hasOwnProperty(property)) return this._aes[property];

		var chartAes = this.chart().getScale(property);
		if (chartAes) return chartAes;
		if (property === 'group') return this.getGroup();
		return null;
	},

	// Checks for a scale on the geom, if one isn't found, we look on the chart and eventually use
	// a default if no scale was explicitly set by the dev.
	getTrainedScale: function(prop) {
		return this.chart().getTrainedScale(prop);
	},

	getDefaultScale: function(property) {
		if (this._defaultAes.hasOwnProperty(property)) {
			var scale = dv.scale.constant().value(this._defaultAes[property]).property(property);
			this._aes[property] = scale;
			delete this._defaultAes[property];
		}
		return this._aes[property];
	},
	
	getScale: function(property) {
		var scale = this.getExplicitScale(property) || this.getDefaultScale(property);
		if(scale instanceof dv.scale.constant) return scale;

		var s = this.getTrainedScale(property);
		return s ? s : scale;
	},

	getGroup: function() {
		// If a group has been explicitly defined, we're done.
		if (this._aes.hasOwnProperty('group')) return this._aes.group;
		// Does chart has an explicit group?  If so let's use it.
		var chartGroup = this.chart().getGroup();
		if (chartGroup && chartGroup.property() === 'group') return chartGroup;

		// Otherwise, let's look for a categorical aesthetic which can serve as a grouping element
		// on the geom.
		var i = -1,
			len = this.categoricalAes.length - 1;
		while (i++ < len) {
			var catAes = this._aes[this.categoricalAes[i]];
			// If the scale has a mapping (not a dv.scale.constant scale), we'll use it.
			if (catAes && !_.isUndefined(catAes.mapping())) return this._aes[this.categoricalAes[i]];
		}

		// If no categorical aesthetic has been explicitly defined on the aes, we'll just use the
		// categorical aesthetic returned from the chart (which may be null).
		return chartGroup;
	},

	each: function(arg1, arg2) {
		var timing, f;
		if (!arguments) return this._each;
		this._each = this._each || {};
		if (arguments.length < 2) {
			f = arg1;
			timing = "end";
		}
		else {
			f = arg2;
			timing = arg1;
		}
		this._each[timing] = f;
		return this;
	},

	behaviors: function(val) {
		if (!arguments.length) return this._behaviors;
		this._behaviors = val;
		return this;
	},

	stat: function(val) { // TODO: Use me!
		if (!arguments) return this._stat;
		this._stat = val;
		return this;
	},

	chart: function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		return this;
	},

	// This property is set by DV and shouldn't be set externally.
	normalizedData: function(val) {
		if (!arguments.length) return this._normalizedData;
		this._normalizedData = val;
		return this;
	},

	data: function(val) {
		if (!arguments.length) return this._data ? this._data : this.chart().data();
		this._data = val;
		return this;
	}
});
dv.geom.point = dv.geom.extend({
	dataPointStyleClass: "point-geom",
	init: function() {
		this._super();
		this._rendererClass = dv.geom.point;
	},

	_initializeDefaultAes: function() {
		this._super();
		this._defaultAes['shape'] = 'circle';
		this._defaultAes['fill'] = '#FAFAFA';
		this._defaultAes['size'] = 7;
	},

	getValues: function(seriesData) {
		return seriesData.values;
	},

	exitSeriesGroup: function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	},

	attributes: function(selection, self) {
		var fillScale = self.getScale('fill'),
			strokeScale = self.getScale('stroke'),
			alphaScale = self.getScale('alpha');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self.dataPointStyleClass, true)
			.style('opacity', function(d, i) { return alphaScale.mapToProp(d, i); })
			.style('stroke', function(d, i) { return strokeScale.mapToProp(d, i); })
			.style('fill', function(d, i) { return fillScale.mapToProp(d, i); });
	},
	
	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapPropToPercent(d, i); },
			y = function() { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	},

	getHighlightColor: function(d, i) {
		var fillScale = this.getScale('fill'),
			strokeScale = this.getScale('stroke');

		if (!(strokeScale instanceof dv.scale.constant))
			return strokeScale.mapToProp(d, i);

		if (!(fillScale instanceof dv.scale.constant))
			return fillScale.mapToProp(d, i);

		return strokeScale.mapToProp(d, i);
	},

	pen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); }, 
			y;
		
		switch(this.position()) {
			case 'identity': 
				y = function(d, i) { return yScale.mapPropToPercent(d, i); };
				break;
			case 'stack': 
				y = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0 + d.y), i); };
				break;
			case 'fill':
				y = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x, y);
	},

	_decoratePen: function(x, y) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			shapeScale = this.getScale('shape'),
			sizeScale = this.getScale('size'),
			self = this;

		var pathRenderer = this.coord().point(xScale, yScale).x(x).y(y)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yScale.mapToProp(d, i)); });

		pathRenderer.renderer
			.type(function(d, i) { return shapeScale.mapToProp(d, i); })
			.size(function(d, i) { return Math.pow(sizeScale.mapToProp(d, i), 2); });

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	}
});
dv.geom.text = dv.geom.extend({
	dataPointStyleClass: "text-geom",
	
	init: function() {
		this._super();
		this._rendererClass = dv.geom.text;
		this._dx = d3.functor(0);
		this._dy = d3.functor(0);
		this._textAnchor = "start";
	},

	dx: function(val) {
		if (!arguments.length) return this._dx;
		this._dx = d3.functor(val);
		return this;
	},

	dy: function(val) {
		if (!arguments.length) return this._dy;
		this._dy = d3.functor(val);
		return this;
	},

	textAnchor: function(val) {
		if (!arguments.length) return this._textAnchor;
		this._textAnchor = val;
		return this;
	},

	getValues: function(seriesData) {
		return seriesData.values;
	},

	updateDataPoints: function(seriesGroups, enterPen, pen, exitPen, self) {
		var alphaScale = self.getScale('alpha');

		seriesGroups.each(function (p, j) {
			var seriesGroup = d3.select(this);
			var _enterPen = enterPen.call(self, j);
			var _updatePen = pen.call(self, j);
			var _exitPen = exitPen.call(self, j);

			var nodes = seriesGroup.selectAll('.' + self.dataPointStyleClass)
				.data(self.getValues(p));

			nodes.exit()
				.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease())
					//.style('opacity', 1e-6)
					.call(_exitPen)
					.each("end.transition", function(d, i) {
						seriesGroups.node().removeChild(this);
					});

			nodes.enter()
				.append('text')
					.attr("class", function(d, i) { return "datum-" + i + " series-" + j; })
					.call(self.attributes, self)
					//.style('opacity', 1e-6)
					.call(_enterPen);

			var updateTransition = nodes.call(self.attributes, self)
				.call(self._removeRegisteredEvents, self)
				.call(self._addRegisteredEvents, self);

			if (dv.ANIMATION) {
				updateTransition = updateTransition.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease());
			}

			updateTransition
				//.style('opacity', function(d, i) { return alphaScale.mapToProp(d[0], i); })
				.call(_updatePen)
				.call(self.addEachFunction, self);
		});
	},

	exitSeriesGroup: function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	},

	exitSeries: function(seriesGroups, exitPen, self) {
		seriesGroups.each(function(p, j) {
			var seriesGroup = d3.select(this),
				_exitPen = exitPen.call(self, j);

			seriesGroup.selectAll('.' + self.dataPointStyleClass)
				.transition()
					.delay(function(d, i) { return self.delay().call(this, d, i, j); })
					.duration(function(d, i) { return self.duration().call(this, d, i, j); })
					.ease(self.ease())
				.call(_exitPen)
				.remove()
				.each("end.transition", function(d, i) {
					var seriesGroupNode = seriesGroup.node();
					seriesGroupNode.removeChild(this);
					if (seriesGroupNode && seriesGroupNode.childNodes && !seriesGroupNode.childNodes.length) {
						seriesGroup.remove();
					}
				});
		});
	},

	attributes: function(selection, self) {
		var strokeColor = self.getScale('stroke'),
			fillColor = self.getScale('fill'),
			alphaScale = self.getScale('alpha');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self.dataPointStyleClass, true)
			.style('stroke', function(d, i) { return strokeColor.mapToProp(d, i); })
			.style('fill', function(d, i) { return fillColor.mapToProp(d, i); })
			.style('opacity', function(d, i) { return alphaScale.mapToProp(d, i); })
			.attr('text-anchor', self._textAnchor);
	},

	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			dx = this._dx,
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2 + dx(d, i, seriesIndex), i); },
			y = function() { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	},

	pen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			dx = this._dx,
			dy = this._dy,
			rangeBand = xScale.rangeBand(),
			yRange = dv.util.scaleRange(yScale),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2 + dx(d, i, seriesIndex), i); },
			y;
		
		switch(this.position()) {
			case 'identity':
				y = function(d, i) { return yScale.mapValueToPercent(yScale.mapToProp(d, i) + dy(d, i, seriesIndex), i); };
				break;
			case 'stack':
				y = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0 + d.y, i) + dy(d, i, seriesIndex), i); };
				break;
			case 'fill':
				y = function(d, i) { return (d.y + d.y0) + yScale.mapValueToPercent(dy(d, i, seriesIndex) + yRange[0], i); };
				break;
		}

		return this._decoratePen(x, y);
	},

	_decoratePen: function(x, y) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			labelScale = this.getScale('label'),
			self = this;

		var textRenderer = this.coord().text(xScale, yScale).x(x).y(y);
		
		return textRenderer()
			.label(function(d, i) { return labelScale.mapToProp(d, i); })
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yScale.mapToProp(d, i)); });
	}
});
dv.geom.line = dv.geom.extend({
	dataPointStyleClass: "line-geom",
	
	init: function() {
		this._super();
		this._tension = 0.7;
		this._interpolate = 'linear';
		this._rendererClass = dv.geom.line;
		// this._rendererClass = dv.renderer.line;
		// this._renderer = this._rendererClass();
	},

	tension: function(val) {
		if (!arguments.length) return this._tension;
		this._tension = val;
		return this;
	},

	// For a list of possible values see:  https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate
	interpolate: function(val) {
		if (!arguments.length) return this._interpolate;
		this._interpolate = val;
		return this;
	},

	render: function(geomGroup) {
		this._super(geomGroup);

		var sizeScale = this.getScale('size');
		if (sizeScale.to && !sizeScale.to()) sizeScale.to([2, 8]);
	},

	getValues: function(seriesData) {
		// A single path within a line geom is mapped to several points (not a 1:1 relationship unlike point)
		return [seriesData.values];
	},

	exitSeriesGroup: function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	},

	attributes: function(selection, self) {
		var strokeScale = self.getScale('stroke'),
			alphaScale = self.getScale('alpha'),
			lineTypeScale = self.getScale('linetype'),
			sizeScale = self.getScale('size');
			
		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self.dataPointStyleClass, true)
			.style('stroke', function(d, i) { return strokeScale.mapToProp(d[0], i); })
			.style('opacity', function(d, i) { return alphaScale.mapToProp(d[0], i); })
			.style('stroke-width', function(d, i) { return sizeScale.mapToProp(d[0], i); })
			.style('stroke-dasharray', function(d, i) { return dv.util.svg.getDasharray(lineTypeScale.mapToProp(d[0], i)); })
			.style('fill', 'none');
	},

	getHighlightColor: function(d, i) {
		return this.getScale('stroke').mapToProp(d, i);
	},

	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y = function(d, i) { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	},

	pen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); }, 
			y;

		switch(this.position()) {
			case 'identity': 
				y = function(d, i) { return yScale.mapPropToPercent(d, i); };
				break;
			case 'stack': 
				y = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0 + d.y), i); };
				break;
			case 'fill':
				y = function(d, i) { return (d.y + d.y0); };
				break;
		}

		return this._decoratePen(x, y);
	},
	
	_decoratePen: function(x, y) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			self = this;

		var pathRenderer = this.coord().line(xScale, yScale).x(x).y(y)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yScale.mapToProp(d, i)); });

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) { return pathRenderer.getBounds(d, i); },
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	}
});
dv.geom.area = dv.geom.extend({
	dataPointStyleClass: "area-geom",
	self: this,
	
	init: function() {
		this._super();
		this._tension = 0.7;
		this._interpolate = 'linear';
		this._rendererClass = dv.geom.area;
	},

	_initializeDefaultAes:function() {
		this._super();
		this._defaultAes['fill'] = '#666';
		this._defaultAes['stroke'] = 'none';
	},

	tension: function(val) {
		if (!arguments.length) return this._tension;
		this._tension = val;
		return this;
	},

	// For a list of possible values see:  https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
	interpolate: function(val) {
		if (!arguments.length) return this._interpolate;
		this._interpolate = val;
		return this;
	},

	getValues: function(seriesData) {
		return [seriesData.values];
	},

	pathTween: function(pathRenderer, selection, d, i, j) {
		var dObj = d,
			currentData,
			previousData = selection.__previousBounds__,
			objTweens = [],
			len,
			_enterPen = this.enterPen.call(this, j),
			current,
			previous,
			xDomain = this.getScale("x").domain(),
			pointI = -1;

		currentData = pathRenderer.getBounds(d, i);
		currentData.coord = this.coord();

		// Transitioning from a polar to a cartesian area is tricky with the area geom.  Let's just make it exit for now and we'll transition the new one in.
		if (previousData && previousData.coord 
				&& (currentData.coord._type !== previousData.coord._type)
					|| currentData.coord.flip() != previousData.coord.flip()) {
			previousData = this.enterPen.call(this, j).bounds(d, i);
		}

		len = Math.max(currentData.length, previousData.length);
		while(++pointI < len) {
			current = (pointI < currentData.length) ? currentData[pointI] : null;
			previous = (pointI < previousData.length) ? previousData[pointI] : null;
			if (!previous) {
				current.x = xDomain[xDomain.length - 1];
				previous = _enterPen.bounds([current], i)[0];
			}
			else if (!current) {
				current = _enterPen.bounds([previous], i)[0];
			}
			objTweens.push(d3.interpolateObject(previous.bounds, current.bounds));
		}

		selection.__previousBounds__ = currentData;

		return function(t) {
			if (t === 1) { // When the transition finishes, trim off any other data points that no longer exist.
				objTweens = objTweens.splice(0, currentData.length);
			}

			var bounds = [];
			_.each(objTweens, function(tween, tweenIndex) { // Iterate through all the tweens and execute them.
				var obj = {};
				obj.bounds = tween(t);
				bounds.push(obj);
			});
			return pathRenderer.getPath(bounds);
		};
	},

	exitSeriesGroup: function(geomGroup, self) {
		self.exitSeries(geomGroup, self.enterPen, self);
	},

	attributes: function(selection, self) {
		var fillScale = self.getScale('fill'),
			alphaScale = self.getScale('alpha');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self.dataPointStyleClass, true)
			.style('fill', function(d, i) { return fillScale.mapToProp(d[0], i); })
			.style('opacity', function(d, i) { return alphaScale.mapToProp(d[0], i); });
	},

	getHighlightColor: function(d, i) {
		return this.getScale('fill').mapToProp(d, i);
	},

	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y = function(d, i) { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(x, y, y);
	},

	pen: function() {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			pathRenderer = this.coord().area(xScale, yScale),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y0, y1;

		switch(this.position()) {
			case 'identity':
				y0 = function(d, i) { return yScale.reverse() ? 1 : 0; };
				y1 = function(d, i) { return yScale.mapPropToPercent(d, i); };
				break;
			case 'stack':
				y0 = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0), i); };
				y1 = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y + d.y0), i); };
				break;
			case 'fill':
				y0 = function(d, i) { return d.y0; }; // Already in percent
				y1 = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x, y0, y1);
	},
	
	_decoratePen: function(x, y0, y1) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			self = this;

		var pathRenderer = this.coord().area(xScale, yScale).x(x).y0(y0).y1(y1)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yScale.mapToProp(d)); });

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) { 
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.coord = self.coord(); 
				}
				return newD;  
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	}
});
dv.geom.rect = dv.geom.extend({
	dataPointStyleClass: "bar-geom",

	init: function() {
		this._super();
		this._rendererClass = dv.geom.rect;
	},

	_initializeDefaultAes:function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		this._defaultAes['xMin'] = 1;
		this._defaultAes['xMax'] = 1;
		this._defaultAes['stroke'] = 'none';
		
		delete this._defaultAes['x'];
		delete this._defaultAes['y'];
	},

	_trainScales:function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		this._createX(this._nestData);
		this._createY(this._nestData);
		this._super(this._nestData);
	},

	_createX: function(data) {
		if (!this._aes['x']) {
			this._aes['x'] = this.getScale('xMax').copy().property('x').mapping('x')
				.trainingProperties(["xMin", "xMax"]);
		}
	},

	_createY: function(data) {
		if (!this._aes['y']) {
			this._aes['y'] = this.getScale('yMax').copy().property('y').mapping('y')
				.trainingProperties(["yMin", "yMax"]);
		}
	},

	getValues: function(seriesData) {
		return seriesData.values;
	},

	render: function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics which
		// are not recognized by chart because they are ribbon-specific aesthetics.
		var yScale = this.getScale('y'),
			xScale = this.getScale('x'),
			yMaxScale = this.getScale('yMax'),
			yMinScale = this.getScale('yMin'),
			xMaxScale = this.getScale('xMax'),
			xMinScale = this.getScale('xMin');

		yMaxScale.range(yScale.range());
		yMaxScale.domain(yScale.domain());
		yMinScale.range(yScale.range());
		yMinScale.domain(yScale.domain());
		xMaxScale.range(xScale.range());
		xMaxScale.domain(xScale.domain());
		xMinScale.range(xScale.range());
		xMinScale.domain(xScale.domain());
		this._super(geomGroup);
	},

	pathTween: function(pathRenderer, selection, d, i, j) {
		var dObj = d,
			currentData,
			previousData = selection.__previousBounds__,
			currentCoord = this.coord()._type;

		if (selection.__exiting__) 
			currentData = selection.__exitTransition__.bounds(d, i);
		else
			currentData = pathRenderer.getBounds(d, i);

		// Transitioning from a polar to a cartesian bar is tricky with the bar geom.
		if ((previousData && previousData.coord && currentCoord !== previousData.coord)) {
			previousData = selection.__exitTransition__.bounds(d, i);
		}

		if (!currentData || !previousData) return null; // This shouldn't happen, but just in case...

		currentData.coord = currentCoord;

		var objTween = d3.interpolateObject(previousData.bounds, currentData.bounds);
		selection.__previousBounds__ = currentData;
		return function(t) {
			dObj.bounds = objTween(t);
			return pathRenderer.getPath(dObj);
		};
	},

	attributes: function(selection, self) {
		var fillScale = self.getScale('fill'),
			strokeScale = self.getScale('stroke'),
			alphaScale = self.getScale('alpha');

		selection.attr('style', '') // Clear out any older styles from previous geoms
			.classed(self.dataPointStyleClass, true)
			.style('fill', function(d, i) { return fillScale.mapToProp(d, i); })
			.style('stroke', function(d, i) { return strokeScale.mapToProp(d, i); })
			.style('opacity', function(d, i) { return alphaScale.mapToProp(d, i); });
	},

	enterPen: function(seriesIndex) {
		var xMinScale = this.getScale('xMin'),
			xMaxScale = this.getScale('xMax'),
			yScale = this.getScale('y'),
			y = function(d, i) { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(
			function(d, i) { return xMinScale.mapPropToPercent(d, i); },
			function(d, i) { return xMaxScale.mapPropToPercent(d, i); },
			y,
			y,
			seriesIndex
		);
	},

	pen: function(seriesIndex) {
		var xMinScale = this.getScale('xMin'),
			xMaxScale = this.getScale('xMax'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			x0, x1, y0, y1;

		return this._decoratePen(
			function(d, i) { return xMinScale.mapPropToPercent(d, i); },
			function(d, i) { return xMaxScale.mapPropToPercent(d, i); },
			function(d, i) { return yMinScale.mapPropToPercent(d, i); },
			function(d, i) { return yMaxScale.mapPropToPercent(d, i); },
			seriesIndex
		);
	},

	_decoratePen: function(x0, x1, y0, y1, seriesIndex) {
		var xMinScale = this.getScale('xMin'),
			xMaxScale = this.getScale('xMax'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			self = this;

		var pathRenderer = this.coord().rect(xScale, yScale).x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(function(d, i) { 
				return _.isFinite(xMinScale.mapToProp(d, i)) 
					&& _.isFinite(xMaxScale.mapToProp(d, i))
					&& _.isFinite(yMinScale.mapToProp(d, i))
					&& _.isFinite(yMaxScale.mapToProp(d, i)); 
			});

		return {
			bounds: function(d, i) { 
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type; 
				}
				return newD; 
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i, seriesIndex); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	}
});
dv.geom.bar = dv.geom.rect.extend({
	dataPointStyleClass: "bar-geom",

	init: function() {
		this._super();
		this._rendererClass = dv.geom.bar;
		this._dodgePadding = 0;
	},

	_initializeDefaultAes: function() {
		this._super();
		this._defaultAes['y'] = 1;
		this._defaultAes['x'] = 1;
	},

	_trainScales:function() {
		// By default we set the domain min to be 0
		var yScale = this.getScale('y'),
			xScale = this.getScale('x');

		if(yScale instanceof dv.scale.continuous) {
			yScale.lowerLimit(Math.min(0, yScale.lowerLimit() || 0));
		} else if(xScale instanceof dv.scale.continuous) {
			xScale.lowerLimit(Math.min(0, xScale.lowerLimit() || 0));
		}
		this._super(this._nestData);
	},
	
	getValues: function(seriesData) {
		return seriesData.values;
	},

	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			y = function(d, i) { return yScale.reverse() ? 1 : 0; }, 
			x0, x1;

		if (this.position() === 'dodge') {
			var numSeries = this._nestData.length,
				slicePadding = rangeBand / (numSeries - 1) * this._dodgePadding,
				barWidth = (rangeBand - (slicePadding * (numSeries - 1))) / numSeries;
			
			// If the series is flipped and we're dodged, render the first series on top instead of bottom.
			seriesIndex = this.coord().flip() ? (numSeries - 1) - seriesIndex : seriesIndex;
			x0 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + (barWidth + slicePadding) * seriesIndex, i); };
			x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + (barWidth + slicePadding) * seriesIndex + barWidth, i); };
		}
		else {
			x0 = function(d, i) { return xScale.mapPropToPercent(d, i); };
			x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); };
		}

		return this._decoratePen(x0, x1, y, y, seriesIndex);
	},

	pen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x0, x1, y0, y1;

		switch (this.position()) {
			case 'identity':
				x0 = function(d, i) { return xScale.mapPropToPercent(d, i); };
				x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); };
				y0 = function(d, i) { return yScale.reverse() ? 1 : 0; };
				y1 = function(d, i) { return yScale.mapPropToPercent(d, i); };
				break;
			case 'stack':
				x0 = function(d, i) { return xScale.mapPropToPercent(d, i); };
				x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); };
				y0 = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0), i); };
				y1 = function(d, i) { return yScale.mapValueToPercent(yScale.mapValue(d.y0 + d.y), i); };
				break;
			case 'dodge':
				var numSeries = this._nestData.length,
					slicePadding = rangeBand / (numSeries - 1) * this._dodgePadding,
					barWidth = (rangeBand - (slicePadding * (numSeries - 1))) / numSeries;
			
				// If the series is flipped and we're dodged, render the first series on top instead of bottom.
				seriesIndex = this.coord().flip() ? (this._nestData.length - 1) - seriesIndex : seriesIndex;
				x0 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + (barWidth + slicePadding) * seriesIndex, i); };
				x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + (barWidth + slicePadding) * seriesIndex + barWidth, i); };
				y0 = function(d, i) { return yScale.reverse() ? 1 : 0; };
				y1 = function(d, i) { return yScale.mapPropToPercent(d, i); };
				break;
			case 'fill':
				x0 = function(d, i) { return xScale.mapPropToPercent(d, i); };
				x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); };
				y0 = function(d, i) { return d.y0; }; // Already in percent
				y1 = function(d, i) { return (d.y + d.y0); }; // Already in percent
				break;
		}

		return this._decoratePen(x0, x1, y0, y1, seriesIndex);
	},

	_decoratePen: function(x0, x1, y0, y1, seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			self = this;

		var pathRenderer = this.coord().rect(xScale, yScale).x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yScale.mapToProp(d, i)); });

		return {
			bounds: function(d, i) { 
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type; 
				}
				return newD; 
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i, seriesIndex); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	},

	dodgePadding: function(val) {
		if (!arguments) return this._dodgePadding;
		this._dodgePadding = val;
		return this;
	}
});
dv.geom.barrange = dv.geom.bar.extend({
	init: function() {
		this._super();
		this._rendererClass = dv.geom.barrange;
	},

	_initializeDefaultAes:function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		delete this._defaultAes['y'];
	},

	_trainScales:function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		if (!this._aes['y']) {
			this._aes['y'] = this.getScale('yMax').copy().property('y').mapping('y')
				.trainingProperties(["yMin", "yMax"]);
		}
		this._super(this._nestData);
	},

	render: function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics which
		// are not recognized by chart because they are ribbon-specific aesthetics.
		var yScale = this.getScale('y'),
			yMaxScale = this.getScale('yMax'),
			yMinScale = this.getScale('yMin');

		// TODO:  What if the yScale is ordinal?  scale.range() wouldn't be what we want here.
		yMaxScale.range(yScale.range());
		yMaxScale.domain(yScale.domain());
		yMinScale.range(yScale.range());
		yMinScale.domain(yScale.domain());
		this._super(geomGroup);
	},

	enterPen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			y = function(d, i) { return yScale.reverse() ? 1 : 0; },
			x0 = function(d, i) { return xScale.mapPropToPercent(d, i); },
			x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); };

		return this._decoratePen(x0, x1, y, y, seriesIndex);
	},
	
	pen: function(seriesIndex) {
		var xScale = this.getScale('x'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			rangeBand = xScale.rangeBand(),
			x0 = function(d, i) { return xScale.mapPropToPercent(d, i); }, 
			x1 = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand, i); }, 
			y0 = function(d, i) { return yMinScale.mapPropToPercent(d, i); }, 
			y1 = function(d, i) { return yMaxScale.mapPropToPercent(d, i); };

		return this._decoratePen(x0, x1, y0, y1, seriesIndex);
	},

	_decoratePen: function(x0, x1, y0, y1, seriesIndex) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			self = this;

		var pathRenderer = this.coord().rect(xScale, yScale).x0(x0).x1(x1).y0(y0).y1(y1)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && (_.isFinite(yScale.mapToProp(d, i)) || (_.isFinite(yMinScale.mapToProp(d, i)) && _.isFinite(yMaxScale.mapToProp(d, i)))); });

		return {
			bounds: function(d, i) { 
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.bounds.coord = self.coord()._type; 
				}
				return newD; 
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i, seriesIndex); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	}
});
dv.geom.segment = dv.geom.line.extend({
	init: function() {
		this._super();
		this._rendererClass = dv.geom.segment;
	},

	getValues: function(seriesData) {
		return seriesData.values;
	},

	enterPen: function() {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y = function(d, i) { return yScale.reverse() ? 1 : 0; };

		return this._decoratePen(x, y);
	},
	
	pen: function() {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y = function(d, i) { return yScale.mapPropToPercent(d, i); };

		return this._decoratePen(x, y);
	}
});
dv.geom.vline = dv.geom.segment.extend({
	
	init: function() {
		this._super();
		this._rendererClass = dv.geom.vline;
	},

	render: function(geomGroup) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			yDomain = yScale.domain(),
			self = this;

		_.each(this._nestData, function(d, i) {
			var values = [];
			_.each(d.values, function(d, i) {
				var x = d[xScale.property()];
				if (_.isArray(d)) {
					d[0].x = x;
					d[0].y = yDomain[0];
					d[1].x = x;
					d[1].y = yDomain[1];
				} else {
					var minMax = [];
					d.x = x;
					d.y = yDomain[0];
					minMax.push(_.clone(d));
					d.y = yDomain[1];
					minMax.push(_.clone(d));

					values.push(minMax);
				}
			});
			self._nestData[i].values = values;
		});

		this._super(geomGroup);
	}

});
dv.geom.hline = dv.geom.segment.extend({
	
	init: function() {
		this._super();
		this._rendererClass = dv.geom.hline;
	},

	render: function(geomGroup) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			xDomain = xScale.domain(),
			self = this;

		_.each(this._nestData, function(d, i) {
			var values = [];
			_.each(d.values, function(d, i) {
				var y = d[yScale.property()];
				if (_.isArray(d)) { // We have already transformed the data...
					d[0].x = xDomain[0];
					d[0].y = y;
					d[1].x = xDomain[1];
					d[1].y = y;
				} else {
					var minMax = [];
					d.x = xDomain[0];
					d.y = y;
					minMax.push(_.clone(d));
					d.x = xDomain[1];
					minMax.push(_.clone(d));

					values.push(minMax);
				}
			});
			self._nestData[i].values = values;
		});

		this._super(geomGroup);
	}
});
// Requires yMax and yMin aesthetics be defined.
dv.geom.ribbon = dv.geom.area.extend({
	init: function() {
		this._super();
		this._rendererClass = dv.geom.ribbon;
	},

	_initializeDefaultAes:function() {
		this._super();
		this._defaultAes['yMin'] = 1;
		this._defaultAes['yMax'] = 1;
		delete this._defaultAes['y'];
	},

	render: function(geomGroup) {
		// The chart's y domain and range have been set, make sure that translates over to yMin and yMax aesthetics which
		// are not recognized by chart because they are ribbon-specific aesthetics.
		var yScale = this.getScale('y'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax');

		yMaxScale.range(yScale.range());
		yMaxScale.domain(yScale.domain());
		yMinScale.range(yScale.range());
		yMinScale.domain(yScale.domain());
		this._super(geomGroup);
	},

	pen: function() {
		var xScale = this.getScale('x'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			rangeBand = xScale.rangeBand(),
			x = function(d, i) { return xScale.mapValueToPercent(xScale.mapToProp(d, i) + rangeBand / 2, i); },
			y0 = function(d, i) { return yMinScale.mapPropToPercent(d, i); },
			y1 = function(d, i) { return yMaxScale.mapPropToPercent(d, i); };

		return this._decoratePen(x, y0, y1);
	},

	_decoratePen: function(x, y0, y1) {
		var xScale = this.getScale('x'),
			yScale = this.getScale('y'),
			yMinScale = this.getScale('yMin'),
			yMaxScale = this.getScale('yMax'),
			self = this;

		var pathRenderer = this.coord().area(xScale, yScale).x(x).y0(y0).y1(y1)
			.defined(function(d, i) { return _.isFinite(xScale.mapToProp(d, i)) && _.isFinite(yMinScale.mapToProp(d)) && _.isFinite(yMinScale.mapToProp(d)); });

		pathRenderer.renderer
			.tension(this.tension())
			.interpolate(this.interpolate());

		return {
			bounds: function(d, i) { 
				var newD = pathRenderer.getBounds(d, i);
				if (newD) {
					newD.coord = self.coord(); 
				}
				return newD;  
			},
			pathTween: function(d, i) { return self.pathTween(pathRenderer, this, d, i); },
			path: function(d, i) { return pathRenderer.getPath(pathRenderer.getBounds(d, i)); }
		};
	},

	_trainScales:function() {
		// This geom won't have a y aesthetic by default (if just has yMax and yMin). So we'll aggregate the yMin and yMax scales
		// to have a unioned y aesthetic.
		if (!this._aes['y']) {
			this._aes['y'] = this.getScale('yMax').copy().property('y').mapping('y')
				.trainingProperties(["yMin", "yMax"]);
		}
		this._super(this._nestData);
	}
});
/**
 * User: nross
 * Date: 3/8/12
 * Time: 1:50 PM
 */
(function(){

dv.behavior = dv.extend({
	
});

})();
dv.behavior.inspector = dv.behavior.extend({
	
	init: function() {
		this._thickness = 2;
		this._size = 50;
		this._lastX = 0;
		this._visible = false;
		this._inspector = null;
		this._thickness = 2;
	},

	render: function(selection) {
		var maxWidth = 0;

		this._xGuide = _.clone(this._chart._axes['x']),
		this._selection = selection;
		this._inspector = selection.select('.inspector');

		if (this._inspector.empty()) {
			this._inspector = selection.append('g')
				.classed('inspector', true)
				.attr('opacity', 1e-6);

			var marker = this._inspector.append('g')
				.classed('inspector-marker', true);

			marker.append('rect')
				.classed('inspector-line', true);

			var tip = marker.append('g')
				.classed('inspector-tip', true);

			tip.append('rect')
				.classed('inspector-tip-background', true)
				.attr('height', 20)
				.attr('y', -14);

			tip.append('text')
				.classed('inspector-tip-label', true)
				.attr('x', 4)
				.attr('y', -2);
		}
		else {
			this._inspector.select('.inspector-tip-label')
			.each(function() {
				maxWidth = Math.max(this.getBBox().width, maxWidth);
			});
		}

		this._inspector.select('.inspector-line')
			.attr('x', (maxWidth - this._thickness) / 2 + 4)
			.attr('y', 0)
			.attr('width', this._thickness)
			.attr('height', this._size);
	},

	_inspectorMove: function(e) {
		if (!e) return;

		var xScale = this._chart.getTrainedScale('x'),
			eventX = d3.svg.mouse(this._selection.node())[0],
			oldEventX = e.offsetX || e.layerX,
			domain,
			index = 0;

		if (xScale instanceof dv.scale.ordinal || xScale instanceof dv.scale.identity) {
			var xRange = dv.util.scaleRangeNoReverse(xScale);
			var totalRange = xRange[1] - xRange[0];
			domain = xScale.domain(); // possible columns
			index = Math.round(eventX / totalRange - 1); // zero-based
		}
		else {
			domain = this._chart.data()[xScale.mapping()];
			index = dv.util.binaryCompare(domain, eventX, function(d) { return xScale.mapValue(d); });
		}

		var constrainedIndex = Math.min(Math.max(index || 0, 0), domain.length - 1);
		var formatter = (this._xGuide.tickFormat) ? this._xGuide.tickFormat() : function(val) { return val; };
		var label = (formatter) ? formatter(domain[constrainedIndex]) : domain[constrainedIndex];
		this.move(xScale.mapValue(domain[constrainedIndex]), label);
	},

	_inspectorOut: function(e) {
		this._inspector
			.transition()
				.delay(4000)
				.duration(2000)
				.attr('opacity', 1e-6);
	},

	_toggleInspectorVisibility: function() {
		if (this._visible) 
			this._show();
		else
			this._hide();
	},

	move: function(x, label) {
		var maxWidth = 0;

		if (this._lastX === x) return;

		this._inspector
			.transition()
				.duration(200)
				.attr('opacity', 1);

		this._inspector.select('.inspector-tip-label')
			.text(label)
			.each(function() {
				maxWidth = Math.max(this.getBBox().width, maxWidth);
			});

		this._inspector.select('.inspector-marker')
			.transition()
				.duration(200)
				.ease(d3.ease('exp-out'))
				.attr('transform', 'translate(' + (x - maxWidth / 2 - 4) + ',0)')
			.transition()
				.duration(200);

		this._inspector.select('.inspector-tip-background')
			.attr('width', maxWidth + 10);

		this._inspector.select('.inspector-line')
			.attr('x', (maxWidth - this._thickness) / 2 + 4);

		this._lastX = x;
	},

	hide: function() {
		this._inspector.attr('opacity', 1e-6);
		this._visible = false;
		return this;
	},

	show: function() {
		this._inspector.attr('opacity', 1);
		this._visible = true;
		return this;
	},

	_addEvents: function() {
		this._chart.on('mousemove.inspector', dv.proxy(this._inspectorMove, this));
		this._chart.on('mouseout.inspector', dv.proxy(this._inspectorOut, this));
	},

	_removeEvents: function() {
		this._chart.on('mousemove.inspector', null);
		this._chart.on('mouseout.inspector', null);
	},

	thickness: function(val) {
		if (!arguments.length) return this._thickness;
		this._thickness = val;
		return this;
	},

	size: function(val) {
		if (!arguments.length) return this._size;
		this._size = val;
		return this;
	},

	chart: function(val) {
		if (!arguments.length) return this._chart;
		if (this._chart) this._removeEvents();
		this._chart = val;
		if (this._chart) this._addEvents();
		return this;
	}
});
dv.behavior.brush = dv.behavior.extend({

	init: function() {
		//this.initializeBrush();
	},

	initializeBrush: function(chart) {
		var self = this;
		this._brush = dv.brush(chart)
			.on("brushstart.brush", function() {
					if (self._brushStart) self._brushStart.call(this, "start", self._brush.extent(), self);
				})
			.on("brush.brush", function(brush) {
					if (self._brushMove) self._brushMove.call(this, "move", self._brush.extent(), self);
				})
			.on("brushend.brush", function() {
					if (self._brushEnd) self._brushEnd.call(this, "end", self._brush.extent(), self);
				});
	},

	_removeEvents: function() {
		this._brush.on("brushstart.brush", null)
			.on("brush.brush", null)
			.on("brushend.brush", null);
	},

	_setScales: function() {
		var x = this._chart.getTrainedScale('x'),
			y = this._chart.getTrainedScale('y');

		this._brush.x(x._d3Scale).y(y._d3Scale);
	},

	render: function(selection) {
		this._selection = selection;
		this._brushContainer = d3.select('.interaction-group');

		if (this._brush.empty()) {
			this._brushContainer //= selection.append('g')
				.classed('brush', true)
				.call(this._brush);
		}
	},

	empty: function() {
		return this._brush.empty();
	},

	clear: function() {
		this._brushContainer.call(this._brush.clear());
	},

	extent: function() {
		return (this._brush) ? this._brush.extent() : null;
	},

	brushStart: function(val) {
		if (!arguments.length) return this._brushStart;
		this._brushStart = val;
		return this;
	},

	brushMove: function(val) {
		if (!arguments.length) return this._brushMove;
		this._brushMove = val;
		return this;
	},

	brushEnd: function(val) {
		if (!arguments.length) return this._brushEnd;
		this._brushEnd = val;
		return this;
	},

	chart: function(val) {
		if (!arguments.length) return this._chart;
		this._chart = val;
		this.initializeBrush(this._chart);
		if (this._chart) this._setScales();
		return this;
	}
});

dv.brush = function(chart) {
	var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"),
		x = null, // x-scale, optional
		y = null, // y-scale, optional
		resizes = d3_svg_brushResizes[0],
		extent = [[0, 0], [0, 0]], // [x0, y0], [x1, y1], in pixels (integers)
		extentDomain; // the extent in data space, lazily created

	function brush(g) {
		g.each(function() {
			var g = d3.select(this),
				bg = g.selectAll(".background").data([0]),
				fg = g.selectAll(".extent").data([0]),
				tz = g.selectAll(".resize").data(resizes, String),
				e;

			chart.on("mousedown.brush", brushstart)
				.on("touchstart.brush", brushstart)
				._g.style("cursor", "crosshair");

			// Prepare the brush container for events.
			g.style("pointer-events", "all");

			// The visible brush extent; style this as you like!
			fg.enter().append("rect")
				.attr("class", "extent")
				.style("cursor", "move");

			// More invisible rects for resizing the extent.
			tz.enter().append("g")
				.attr("class", function(d) { return "resize " + d; })
				.style("cursor", function(d) { return d3_svg_brushCursor[d]; })
			.append("rect")
				.attr("x", function(d) { return /[ew]$/.test(d) ? -3 : null; })
				.attr("y", function(d) { return /^[ns]/.test(d) ? -3 : null; })
				.attr("width", 6)
				.attr("height", 6)
				.style("visibility", "hidden");

			// Show or hide the resizers.
			tz.style("display", brush.empty() ? "none" : null);

			// Remove any superfluous resizers.
			tz.exit().remove();

			// Initialize the background to fill the defined range.
			// If the range isn't defined, you can post-process.
			if (x) {
				e = dv.util.scaleRangeNoReverse(x);
				bg.attr("x", e[0]).attr("width", e[1] - e[0]);
				redrawX(g);
			}
			if (y) {
				e = dv.util.scaleRangeNoReverse(y);
				bg.attr("y", e[0]).attr("height", e[1] - e[0]);
				redrawY(g);
			}
			redraw(g);
		});
	}

	function redraw(g) {
		g.selectAll(".resize").attr("transform", function(d) {
			return "translate(" + extent[+/e$/.test(d)][0] + "," + extent[+/^s/.test(d)][1] + ")";
		});
	}

	function redrawX(g) {
		g.select(".extent").attr("x", extent[0][0]);
		g.selectAll(".extent,.n>rect,.s>rect").attr("width", extent[1][0] - extent[0][0]);
	}

	function redrawY(g) {
		g.select(".extent").attr("y", extent[0][1]);
		g.selectAll(".extent,.e>rect,.w>rect").attr("height", extent[1][1] - extent[0][1]);
	}

	function brushstart() {
		var target = this,
			eventTarget = d3.select(d3.event.target),
			event_ = event.of(target, arguments),
			g = d3.select(target),
			resizing = eventTarget.datum(),
			resizingX = !/^(n|s)$/.test(resizing) && x,
			resizingY = !/^(e|w)$/.test(resizing) && y,
			dragging = eventTarget.classed("extent"),
			center,
			origin = mouse(),
			offset;

		var w = d3.select(window)
			.on("mousemove.brush", brushmove)
			.on("mouseup.brush", brushend)
			.on("touchmove.brush", brushmove)
			.on("touchend.brush", brushend)
			.on("keydown.brush", keydown)
			.on("keyup.brush", keyup);

		// If the extent was clicked on, drag rather than brush;
		// store the point between the mouse and extent origin instead.
		if (dragging) {
			origin[0] = extent[0][0] - origin[0];
			origin[1] = extent[0][1] - origin[1];
		}

		// If a resizer was clicked on, record which side is to be resized.
		// Also, set the origin to the opposite side.
		else if (resizing && (resizing === "e" || resizing === "w" || resizing === "s" || resizing === "n"
				|| resizing === "nw" || resizing === "ne" || resizing === "sw" || resizing === "se")) {
			var ex = +/w$/.test(resizing),
				ey = +/^n/.test(resizing);
			offset = [extent[1 - ex][0] - origin[0], extent[1 - ey][1] - origin[1]];
			origin[0] = extent[ex][0];
			origin[1] = extent[ey][1];
		}

		// If the ALT key is down when starting a brush, the center is at the mouse.
		else if (d3.event.altKey) center = origin.slice();

		// Propagate the active cursor to the body for the drag duration.
		g.style("pointer-events", "none").selectAll(".resize").style("display", null);
		d3.select("body").style("cursor", eventTarget.style("cursor"));

		// Notify listeners.
		event_({type: "brushstart"});
		brushmove();
		d3_eventCancel();

		function mouse() {
			var touches = d3.event.changedTouches;
			return touches ? d3.touches(target, touches)[0] : d3.mouse(target);
		}

		function keydown() {
			if (d3.event.keyCode == 32) {
				if (!dragging) {
					center = null;
					origin[0] -= extent[1][0];
					origin[1] -= extent[1][1];
					dragging = 2;
				}
				d3_eventCancel();
			}
		}

		function keyup() {
			if (d3.event.keyCode == 32 && dragging == 2) {
			origin[0] += extent[1][0];
			origin[1] += extent[1][1];
			dragging = 0;
			d3_eventCancel();
			}
		}

		function brushmove() {
			var point = mouse(),
				moved = false;

			// Preserve the offset for thick resizers.
			if (offset) {
				point[0] += offset[0];
				point[1] += offset[1];
			}

			if (!dragging) {

				// If needed, determine the center from the current extent.
				if (d3.event.altKey) {
					if (!center) center = [(extent[0][0] + extent[1][0]) / 2, (extent[0][1] + extent[1][1]) / 2];

					// Update the origin, for when the ALT key is released.
					origin[0] = extent[+(point[0] < center[0])][0];
					origin[1] = extent[+(point[1] < center[1])][1];
				}

				// When the ALT key is released, we clear the center.
				else center = null;
			}

			// Update the brush extent for each dimension.
			if (resizingX && move1(point, x, 0)) {
				redrawX(g);
				moved = true;
			}
			if (resizingY && move1(point, y, 1)) {
				redrawY(g);
				moved = true;
			}

			// Final redraw and notify listeners.
			if (moved) {
				redraw(g);
				event_({type: "brush", mode: dragging ? "move" : "resize"});
			}
		}

		function move1(point, scale, i) {
			var range = dv.util.scaleRangeNoReverse(scale),
				r0 = range[0],
				r1 = range[1],
				position = origin[i],
				size = extent[1][i] - extent[0][i],
				min,
				max;

			// When dragging, reduce the range by the extent size and position.
			if (dragging) {
				r0 -= position;
				r1 -= size + position;
			}

			// Clamp the point so that the extent fits within the range extent.
			min = Math.max(r0, Math.min(r1, point[i]));

			// Compute the new extent bounds.
			if (dragging) {
				max = (min += position) + size;
			} else {

				// If the ALT key is pressed, then preserve the center of the extent.
				if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));

				// Compute the min and max of the position and point.
				if (position < min) {
					max = min;
					min = position;
				} else {
					max = position;
				}
			}

			// Update the stored bounds.
			if (extent[0][i] !== min || extent[1][i] !== max) {
				extentDomain = null;
				extent[0][i] = min;
				extent[1][i] = max;
				return true;
			}
		}

		function brushend() {
			brushmove();

			// reset the cursor styles
			g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
			d3.select("body").style("cursor", null);

			w .on("mousemove.brush", null)
			.on("mouseup.brush", null)
			.on("touchmove.brush", null)
			.on("touchend.brush", null)
			.on("keydown.brush", null)
			.on("keyup.brush", null);

			event_({type: "brushend"});
			d3_eventCancel();
		}
	}

	brush.x = function(z) {
		if (!arguments.length) return x;
		x = z;
		resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
		return brush;
	};

	brush.y = function(z) {
		if (!arguments.length) return y;
		y = z;
		resizes = d3_svg_brushResizes[!x << 1 | !y]; // fore!
		return brush;
	};

	brush.extent = function(z) {
		var x0, x1, y0, y1, t;

		// Invert the pixel extent to data-space.
		if (!arguments.length) {
			z = extentDomain || extent;
			if (x) {
				x0 = z[0][0], x1 = z[1][0];
				if (!extentDomain) {
					x0 = extent[0][0], x1 = extent[1][0];
					if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
					if (x1 < x0) t = x0, x0 = x1, x1 = t;
				}
			}
			if (y) {
				y0 = z[0][1], y1 = z[1][1];
				if (!extentDomain) {
					y0 = extent[0][1], y1 = extent[1][1];
					if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
					if (y1 < y0) t = y0, y0 = y1, y1 = t;
				}
			}
			return x && y ? [[x0, y0], [x1, y1]] : x ? [x0, x1] : y && [y0, y1];
		}

		// Scale the data-space extent to pixels.
		extentDomain = [[0, 0], [0, 0]];
		if (x) {
			x0 = z[0], x1 = z[1];
			if (y) x0 = x0[0], x1 = x1[0];
			extentDomain[0][0] = x0, extentDomain[1][0] = x1;
			if (x.invert) x0 = x(x0), x1 = x(x1);
			if (x1 < x0) t = x0, x0 = x1, x1 = t;
			extent[0][0] = x0 | 0, extent[1][0] = x1 | 0;
		}
		if (y) {
			y0 = z[0], y1 = z[1];
			if (x) y0 = y0[1], y1 = y1[1];
			extentDomain[0][1] = y0, extentDomain[1][1] = y1;
			if (y.invert) y0 = y(y0), y1 = y(y1);
			if (y1 < y0) t = y0, y0 = y1, y1 = t;
			extent[0][1] = y0 | 0, extent[1][1] = y1 | 0;
		}

		return brush;
	};

	brush.clear = function() {
		extentDomain = null;
		extent[0][0] =
		extent[0][1] =
		extent[1][0] =
		extent[1][1] = 0;
		return brush;
	};

	brush.empty = function() {
		return (x && extent[0][0] === extent[1][0])
			|| (y && extent[0][1] === extent[1][1]);
	};

	return d3.rebind(brush, event, "on");
};

var d3_svg_brushCursor = {
	n: "ns-resize",
	e: "ew-resize",
	s: "ns-resize",
	w: "ew-resize",
	nw: "nwse-resize",
	ne: "nesw-resize",
	se: "nwse-resize",
	sw: "nesw-resize"
};

var d3_svg_brushResizes = [
	["n", "e", "s", "w", "nw", "ne", "se", "sw"],
	["e", "w"],
	["n", "s"],
	[]
];

function d3_dispatch() {}
function d3_dispatch_event(dispatch) {
	function event() {
		var z = listeners, i = -1, n = z.length, l;
		while (++i < n) if (l = z[i].on) l.apply(this, arguments);
		return dispatch;
	}
	var listeners = [], listenerByName = new d3.map;
	event.on = function(name, listener) {
		var l = listenerByName.get(name), i;
		if (arguments.length < 2) return l && l.on;
		if (l) {
			l.on = null;
			listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
			listenerByName.remove(name);
		}
		if (listener) listeners.push(listenerByName.set(name, {
			on: listener
		}));
		return dispatch;
	};
	return event;
}

d3_dispatch.prototype.on = function(type, listener) {
		var i = type.indexOf("."), name = "";
		if (i > 0) {
			name = type.substring(i + 1);
			type = type.substring(0, i);
		}
		return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	};

function d3_eventDispatch(target) {
	var dispatch = new d3_dispatch, i = 0, n = arguments.length;
	while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	dispatch.of = function(thiz, argumentz) {
		return function(e1) {
			try {
				var e0 = e1.sourceEvent = d3.event;
				e1.target = target;
				d3.event = e1;
				dispatch[e1.type].apply(thiz, argumentz);
			} finally {
				d3.event = e0;
			}
		};
	};
	return dispatch;
}

function d3_eventCancel() {
	d3.event.stopPropagation();
	d3.event.preventDefault();
}

dv.behavior.rollover = dv.behavior.extend({

	init: function() {
		this._selection = null;
		this._showTooltip = this._defaultShowTooltip;
		this._hideTooltip = this._defaultHideTooltip;
		this._orientation = "top";
		this._tooltipPadding = 18;
		this._xScale = null;
		this._yScale = null;
	},

	// Called internally by DV when the behavior is ready for rendering.
	render: function(selection) {
		this._isPolar = (this._geom.coord() instanceof dv.coord.polar);
		this._xScale = this._geom.getTrainedScale('x');
		this._yScale = this._geom.getTrainedScale('y');
		this._selection = selection;
		this.addEvents();
	},

	// Add events to the corresponding geom to handle hover events.
	addEvents: function() {
		var self = this;
		this._geom
			.on("mouseover", function(d, i, j) {
				self._showTooltip.call(this, d, i, j, d3.event, self);
			})
			.on("mouseout", function(d, i, j) {
				self._hideTooltip.call(this, d, i, j, d3.event, self);
			});
	},

	// The default functionality for when a tooltip should be shown.  This can be overriden by supplying a function to `showTooltip`.
	_defaultShowTooltip: function(d, i, j, event, self) {
		self._darkenGeom.call(this, d, i, j, self);
		self._showTip.call(this, d, i, j, self);
	},

	// The default functionality for when a tooltip should be removed.  This can be overriden by supplying a function to `hideTooltip`
	_defaultHideTooltip: function(d, i, j, event, self) {
		self._brightenGeom.call(this, d, i, j, self);
		self._removeTip.call(this, d, i, j, self);
	},

	// Darken the color of the geom to show it's being hovered on.
	_darkenGeom: function(d, i, j, self) {
		var singleGeom = d3.select(this),
			fill, 
			stroke,
			darken = function(attr, d, geom) {
				if (d[attr]) {
					var color = self._geom.getScale(attr).mapValue(d[attr]);
					geom.style(attr, d3.rgb(color).darker(1).toString());
				}
			};

		darken("fill", d, singleGeom);
		darken("stroke", d, singleGeom);
	},

	// Restore the geom to its original brighter color.
	_brightenGeom: function(d, i, j, self) {
		var singleGeom = d3.select(this),
			fill, 
			stroke,
			darken = function(attr, d, geom) {
				if (d[attr]) {
					var color = self._geom.getScale(attr).mapValue(d[attr]);
					geom.style(attr, color);
				}
			};

		darken("fill", d, singleGeom);
		darken("stroke", d, singleGeom);
	},

	// Show the tooltip on mouseover
	_showTip: function(d, i, j, self) {
		var parent = d3.select(self._geom.chart()._parent.node()),
			seriesGroup = self._geom.getExplicitScale("group") || self._geom.getDefaultScale("group"),
			content = "<p>" + d.data[self._yScale.mapping()] + " at " + d.data[self._xScale.mapping()] + "</p>",
			position = [d3.event.offsetX, d3.event.offsetY];

		if (seriesGroup && seriesGroup.mapping()) {
			content = "<h3>" + d.data[seriesGroup.mapping()] + "</h3><hr/>" + content;
		}

		dv.showTooltip(position, content, self._orientation, self._tooltipPadding, parent);
	},

	// Remove the tooltip on mouseout.
	_removeTip: function(d, i, j, self) {
		dv.removeTooltip();
	},

	// The amount of space between the point and the tooltip edge.
	tooltipPadding: function(val) {
		if (!arguments.length) return this._tooltipPadding;
		this._tooltipPadding = val;
		return this;
	},

	// Where the tooltip should be positioned relative to the point:  top, left, bottom, right
	orientation: function(val) {
		if (!arguments.length) return this._orientation;
		this._orientation = val;
		return this;
	},

	// An overridable function that will be called on hover.  If this is undefined, the default tooltip functionality will be used.
	showTooltip: function(val) {
		if (!arguments.length) return this._showTooltip;
		this._showTooltip = val;
		return this;
	},

	// An overridable function that will be called on mouseout.  If this is undefined, the default tooltip functionality will be used.
	hideTooltip: function(val) {
		if (!arguments.length) return this._hideTooltip;
		this._hideTooltip = val;
		return this;
	},

	// The parent geom that selection will be applied to.  This will be set automatically by DV.
	geom: function(val) {
		if (!arguments.length) return this._geom;
		this._geom = val;
		return this;
	}
});
dv.behavior.voronoiRollover = dv.behavior.rollover.extend({

	init: function() {
		this._selection = null;
		this._voronoiContainer = null;
		this._points = null;
		this._pointDetectionRadius = 12;
		this._numHitAreaVertices = 12;
		this._isPolar = false;
		this._showTooltip = this._defaultShowTooltip;
		this._hideTooltip = this._defaultHideTooltip;
		this._orientation = "top";
		this._tooltipPadding = 18;
		this._xScale = null;
		this._yScale = null;
	},

	// Called internally by DV when the behavior is ready for rendering.
	render: function(selection) {
		this._xGuide = _.clone(this._geom._chart._axes['x']);
		this._yGuide = _.clone(this._geom._chart._axes['y']);
		this._isPolar = (this._geom.coord() instanceof dv.coord.polar);
		this._xScale = this._geom.getTrainedScale('x');
		this._yScale = this._geom.getTrainedScale('y');
		this._selection = selection;
		this._createTooltipContainer();
		this._renderPolygons(this._getPolygonData(), selection);
	},

	// See if a containing SVG group already exists that we can reuse, otherwise create one.
	_createTooltipContainer: function() {
		this._voronoiContainer = this._selection.select('.voronoiSelection-container');

		if (this._voronoiContainer.empty()) {
			this._voronoiContainer = this._selection.append('g')
				.classed('voronoiSelection-container', true);
		}

		// Bind this class to the tooltip container group.
		this._voronoiContainer.datum(this);
	},

	_getPolygonData: function() {
		var polygonData,
			vertices = [],
			data = this._geom._nestData,
			self = this;

		this._points = [];

		var pathRenderer = self._geom.coord().point(self._xScale, self._yScale)
			.x(function(d, i) { return d.x; })
			.y(function(d, i) { return d.y; })
			.defined(function(d, i) { return true; });

		// Create an array of [[x1, y1], [x2, y2], ...] vertices to feed into d3.geom.voronoi.  
		// Or can we get away with x and y lookups on the object and throw errors on geoms that don't have both of them as not being supported?
		// 
		// TODO: There is currently an open bug in D3 to make accessor functions for x and y in d3.geom.voronoi which could eliminate this double
		// loop. When this is fixed, remove the double loop.  https://github.com/mbostock/d3/issues/558
		_.each(this._geom._nestData, function(seriesArray, j) {
			_.each(seriesArray.values, function(d, i) {
				var cd = _.clone(d);
				cd.x = self._xScale.mapPropToPercent(d);
				cd.y = self._yScale.mapValueToPercent(self._yScale.mapValue(d.hasOwnProperty('y0') ? (d.y + d.y0) : d.y), i);
				var range = _.clone(pathRenderer.getBounds(cd, i));

				// If we're in polar space, we've currently got angle and radius info that we need to transform into x and y points. If we're in cartesian,
				// this is already handled for us.
				if (self._isPolar) {
					var xyPoint = self._geom.coord().transformAngleRadiusToXY(range.bounds.x, range.bounds.y);
					range.bounds.x = xyPoint[0];
					range.bounds.y = xyPoint[1];
				}

				self._points.push({ data: range, seriesIndex: j, index: i });
				// D3's voronoi algorithm does work if any of the vertices are identical, so I'll add a little visually imperceptible noise to the vertices.
				// D3 Group Thread: https://groups.google.com/forum/?fromgroups=#!msg/d3-js/u2YPiiMuzFc/fU9_2jZUUo4J
				// D3 Bug: https://github.com/mbostock/d3/issues/235
				vertices.push([range.bounds.x * (Math.random() / 1e12 + 1), range.bounds.y * (Math.random() / 1e12 + 1)]);
			});
		});

		return d3.geom.voronoi(vertices);
	},

	_renderPolygons: function(polygonData, selection) {
		var self = this,
			numSeries = this._geom._nestData.length,
			numItemsPerSeries = this._geom._nestData[0].values.length,
			geomParent = d3.select(selection.node().parentNode),
			x = 0,
			y = 0,
			pointInfo;

		// Center the SVG group in the middle of the plot if we're in polar.
		if (this._isPolar) {
			var xRange = dv.util.scaleRangeNoReverse(this._xScale),
				yRange = dv.util.scaleRangeNoReverse(this._yScale);
			x = (xRange[0] + xRange[1]) / 2;
			y = (yRange[0] + yRange[1]) / 2;
		}
		
		this._voronoiContainer
			.attr("transform", 'translate(' + x + ',' + y + ')');

		// Draw clipped voronoi paths.
		var paths = this._voronoiContainer.selectAll("path")
			.data(polygonData);

		paths.exit().remove();
			
		paths.enter().append("path")
			.attr("id", function(d, i) { return "path-" + i; })
			.classed("voronoi-overlay", true)
			.style("fill", "#000")
			.style('fill-opacity', 0);

		paths
			.attr("d", function(d, i) { return self._getPolygonPath(d, i, self); })
			.on("mouseover.voronoiSelection", function(d, i) { // intercept the event and add our own parameters...
				pointInfo = self._points[i];
				self._showTooltip.call(this, pointInfo.data, pointInfo.index, pointInfo.seriesIndex, d3.event, self);
			})
			.on("mouseout.voronoiSelection", function(d, i) {
				pointInfo = self._points[i];
				self._hideTooltip.call(this, pointInfo.data, pointInfo.index, pointInfo.seriesIndex, d3.event, self);
			})
			.call(this._removeRegisteredEvents, this)
			.call(this._addRegisteredEvents, this);

		paths.exit()
			.on("mouseover.voronoiSelection", null)
			.on("mouseover.voronoiSelection", null);
	},

	_addRegisteredEvents: function(paths, self) {
		if (!self) self = this;
		if (!self._geom) return;

		paths = paths || self._voronoiContainer.selectAll('.voronoi-overlay');
		_.each(self._geom.eventMap, function(e, type) {
			paths.on(type, function(d, i) {
				self.eventMap[type].callback.call(this, d, i, d3.event);
			}, e.capture);
		});
		_.each(self._geom._chart.eventMap, function(e, type) {
			paths.on(type + ".dvchart", function(d, i) {
				var e = d3.event,
					interactionGroup = self._geom._chart._interactionGroup.node();

				if (self._shouldDispatchChartEvent(e, interactionGroup)) {
					self._geom._chart.eventMap[type].callback.call(interactionGroup, e);
				}
			}, e.capture);
		});
	},

	_removeRegisteredEvents: function(paths, self) {
		if (!self) self = this;
		if (!self._geom) return;

		paths = paths || self._voronoiContainer.selectAll('.voronoi-overlay');
		_.each(self.unregisterEventMap, function(capture, type) {
			paths.on(type, null, capture);
		});
		_.each(self._geom._chart.unregisterEventMap, function(capture, type) {
			paths.on(type + ".dvchart", null, capture);
		});
	},

	_shouldDispatchChartEvent: function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out/over events when rolling over voronoi paths contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var rTarg = e.relatedTarget;
			if (!rTarg) 
				rTarg = (e.type === "mouseout") ? e.toElement : e.fromElement;

			var relTarget = d3.select(rTarg);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !((relTarget.node() === interactionGroup) || relTarget.classed("voronoi-overlay"));
			}
		}
		return result;
	},

	// Creates a clipping polygon and performs the clip on the voronoi polygon `d`
	_getPolygonPath: function(d, i, self) {
		var temp = _.clone(d);
		var pointInfo = self._points[i];
		var polygon = d3.geom.polygon(self._getPolygonPoints(pointInfo.data.bounds.x, pointInfo.data.bounds.y));
		var vertices = polygon.clip(d);

		// As a last resort, if d has no length, we'll just have to use the entire clipping polygon as our hit area.
		// There is a bug with D3.js where d3.geom.voronoi doesn't work correctly if points are collinear.
		// 
		// Mike Bostock suggests using random jitter to solve the problem, but that doesn't seem to work. I'm adding
		// random jitter above and still getting this problem when I use a position fill on a lot of 
		// points.
		// https://github.com/mbostock/d3/issues/235#issuecomment-4337152
		if (!vertices.length) vertices = polygon;
		return (vertices.length) ? ("M" + vertices.join("L") + "Z") : null;
	},

	// Get the polygon we'll use for clipping a corresponding voronoi polygon.
	_getPolygonPoints: function(centerX, centerY) {
		var points = [];

		for (var i = 360; i > 0; i -= 360 / this._numHitAreaVertices) {
			var radians = i * Math.PI / 180,
				x = Math.cos(radians) * this._pointDetectionRadius + centerX,
				y = Math.sin(radians) * this._pointDetectionRadius + centerY;
			points.push([x, y]);
		}

		return points;
	},

	// The default functionality for when a tooltip should be shown.  This can be overriden by supplying a function to `showTooltip`.
	_defaultShowTooltip: function(d, i, j, event, self) {
		self._showPoint.call(this, d, i, j, self);
		self._showTip.call(this, d, i, j, self);
	},

	// The default functionality for when a tooltip should be removed.  This can be overriden by supplying a function to `hideTooltip`
	_defaultHideTooltip: function(d, i, j, event, self) {
		self._removePoint.call(this, d, i, j, self);
		self._removeTip.call(this, d, i, j, self);
	},

	// Show a point on hover.
	_showPoint: function(d, i, j, self) {
		self._voronoiContainer
			.append("circle")
				.classed("hover-point", true)
				.attr("id", "point-" + j + "-" + i)
				.attr("cx", d.bounds.x)
				.attr("cy", d.bounds.y)
				.attr("r", 0)
				.style("stroke", function() { return self._geom.getHighlightColor(d, i); })
				.style("pointer-events", "none")
				.transition()
					.duration(350)
					.attr("r", 10);
	},

	// Remove the point we've added on mouseout.
	_removePoint: function(d, i, j, self) {
		self._voronoiContainer.selectAll("#point-" + j + "-" + i)
			.transition()
				.duration(350)
				.attr("r", 0)
				.remove();
	},

	// Show a tooltip on hover.
	_showTip: function(d, i, j, self) {
		var parent = d3.select(self._geom.chart()._parent.node()),
			xTickFormat = (self._xGuide.tickFormat() ? self._xGuide.tickFormat() : String),
			yTickFormat = (self._yGuide.tickFormat() ? self._yGuide.tickFormat() : String),
			seriesGroup = self._geom.getExplicitScale("group") || self._geom.getDefaultScale("group"),
			content = "<p>" + yTickFormat(d.data[self._yScale.mapping()]) + " at " + xTickFormat(d.data[self._xScale.mapping()]) + "</p>",
			position = dv.absoluteCoordinates(self._geom.chart(), [d.bounds.x, d.bounds.y]);

		if (seriesGroup && seriesGroup.mapping()) {
			content = "<h3>" + d.data[seriesGroup.mapping()] + "</h3><hr/>" + content;
		}

		dv.showTooltip(position, content, self._orientation, self._tooltipPadding, parent);
	},

	// The radius of the voronoi clipping polygon.
	pointDetectionRadius: function(val) {
		if (!arguments.length) return this._pointDetectionRadius;
		this._pointDetectionRadius = val;
		return this;
	},

	// The number of vertices on the voronoi clipping polygon.
	numHitAreaVertices: function(val) {
		if (!arguments.length) return this._numHitAreaVertices;
		this._numHitAreaVertices = val;
		return this;
	}
});
dv.chart = dv.container.extend({
	init: function() {
		this._super();

		this._firstRender = false;
		
		this._data = {};
		this._coord = dv.coord.cartesian();
		this._facet = {}; // TODO: Implement faceting system
		this._layers = []; // Child layers which create different plots and layer them on top of each other.
		this._behaviors = []; // Interactions
		this._legends = [];
		this._axes = {};

		// Animation properties
		this._delay = d3.functor(0);
		this._duration = d3.functor(1000);
		this._ease = "cubic-in-out";

		this._parent = null;
		this._g = null;
		this._interactionGroup = null;

		this._width = NaN;
		this._height = NaN;
		this._defaultPadding = this._padding = {"top": 10, "left": 10, "right": 10, "bottom": 10};
		this._position = 'identity';
	},
	
	render: function() {
		this._createSVGContainer();
		this._calculateDimensions();
		this._prerender();
		this._handleFaceting();
		this._renderGuides();
		this._renderLayers();
		this._renderBehaviors();
		this._cleanupGuides();

		// Clean up our unregister event map. All chart events should have been elimintated by now.
		this.unregisterEventMap = null;
		return this;
	},

	_calculateDimensions: function() {
		this._width = isNaN(this._width) ? this._parent.node().offsetWidth : this._width;
		this._height = isNaN(this._height) ? this._parent.node().offsetHeight : this._height;
		this._svgContainer.attr('width', this._width).attr('height', this._height);
	},

	// TODO: we should find a better way to handle this, but we need to call pre-render on each geom before we train scales.
	_prerender: function() {
		this._trainedScales = {}; // Unioned domains and plotting ranges for all properties (accessible by all geoms in the chart)
		this._calculateStats();
		this._handlePositions();

		var self = this;
		_.each(this._layers, function(geom) {
			geom._prerender(self);
		});

		var _normalizedData = this._normalizeData(this.data());
		this.data(_normalizedData);

		// By default DV renders both axes
		if(!this._axes.hasOwnProperty('x')) this._axes['x'] = dv.guide.axis();
		if(!this._axes.hasOwnProperty('y')) this._axes['y'] = dv.guide.axis();

		this.plotBounds({
			left: this._padding.left,
			top: this._padding.top,
			right: this._width - this._padding.right,
			bottom: this._height - this._padding.bottom
		});
		
		if (this._coord instanceof dv.coord.cartesian) {
			this._plotBounds.right -= this._coord.endX();
			this._plotBounds.left += this._coord.startX();
		}

	},

	_createSVGContainer: function() {
		this._svgContainer = this._parent.select('svg');

		if (this._svgContainer.empty())
			this._svgContainer = this._parent.append('svg');

		this._g = this._svgContainer.select('.group');

		// Only create our scaffolding if we don't have a <g class="group" /> element under the root SVG node.
		// Otherwise, we'll use what we have here.
		if (this._g.empty()) {
			this._firstRender = true;
			this._g = this._svgContainer.append('g').classed('group', true);

			this._g.append('rect').classed('plot-bg', true);
			this._g.append('g').classed('axes', true);
			this._interactionGroup = this._g.append('g').classed("interaction-group", true).style("pointer-events", "all");
			this._g.append('g').classed('behavior', true);
			this._g.append('g').classed('plot', true);
			this._g.append('g').classed('legends', true);
			this._g.append('g').classed('axes-labels', true);

			this._interactionGroup.append('rect').classed('interaction-canvas', true).classed('background', true);
		}

		if (!this._interactionGroup) {
			this._interactionGroup = this._g.select('.interaction-group');
		}
	},

	_addRegisteredEvents: function() {
		var self = this;
		_.each(self.eventMap, function(e, type) {
			self._interactionGroup.on(type, function() { // intercept the event and add our own parameters...
					var e = d3.event,
						interactionGroup = self._interactionGroup.node();
					if (self._shouldDispatchChartEvent(e, interactionGroup)) {
						self.eventMap[type].callback.call(self._interactionGroup.node(), d3.event);
					}
				}, e.capture);
		});

		// Forward this event on to the geoms
		_.each(self._layers, function(geom) {
			geom._addRegisteredEvents();
		});
	},

	_removeRegisteredEvents: function() {
		var self = this;
		_.each(self.unregisterEventMap, function(capture, type) {
			self._interactionGroup.on(type, null, capture);
		});

		// Forward this event on to the geoms
		_.each(self._layers, function(geom) {
			geom._removeRegisteredEvents();
		});
	},

	_shouldDispatchChartEvent: function(e, interactionGroup) {
		var result = true;

		// Our chart shouldn't dispatch mouse out events when rolling over geoms contained within the plot.
		if (e.type === "mouseout" || e.type === "mouseover") {
			var relTarget = d3.select(e.relatedTarget);
			if (relTarget && !relTarget.empty()) {
				var className = relTarget.attr('class');
				result = !(className && className.indexOf('-geom') >= 0);
			}
		}
		return result;
	},
	_calculateStats: function() {
	},

	_handlePositions: function() {
	},

	_handleFaceting: function() {
	},

	_renderGuides: function() {
		this._setRanges();
		this._renderLegends();
		this._setRanges();
		this._renderAxes();
		this._setRanges();

		// TODO: This really should occur in the renderLayers (or just before it) since this is updating the plottable area bg.
		// The bounds for this should be updated however by changes made in this function (update the bounds after rendering guides)
		var plotBg = this._g.select('.plot-bg');

		if (!this._firstRender) {
			plotBg = plotBg.transition()
			.duration(this._duration);
		}
		
		plotBg.attr('x', this._plotBounds.left)
			.attr('y', this._plotBounds.top)
			.attr('width', this._plotBounds.right - this._plotBounds.left)
			.attr('height', this._plotBounds.bottom - this._plotBounds.top);
	},

	_cleanupGuides: function() {
		this._legends = [];
		this._axes = {};
	},

	_renderLegends: function() {
		var self = this,
			parent = this._g.select('.legends'),
			bounds = this.plotBounds();

		var legends = parent.selectAll(".legend")
			.data(this._legends);

		legends.exit()
			.transition()
				.duration(this._duration)
				.style("opacity", 0)
				.remove();

		var enterG = legends.enter()
			.append('g')
				.classed("legend", true);

		if (dv.ANIMATION) {
			enterG.style("opacity", 0);
		}

		legends.each(function(d, i) {
			var scales = {};
			for (var j = 0; j < d.props.length; j++) {
				scales[d.props[j]] = self.getTrainedScale(d.props[j]);
			}
			d.guide.chart(self).render(d3.select(this), bounds, (d.hide) ? [] : scales);
			bounds = d.guide.getPlotBounds(bounds);
			self.plotBounds(bounds);
		});
	},

	_renderAxes: function() {
		var parent = this._g.select('.axes'),
			labelContainer = this._g.select('.axes-labels'),
			bounds = this.plotBounds();

		// Make sure every valid axis has an orientation before we perform flip logic.
		if (this._axes.hasOwnProperty("x") && !this._axes.x.hasOwnProperty("_orientation"))
			this._axes.x._orientation = "bottom";
		if (this._axes.hasOwnProperty("y") && !this._axes.y.hasOwnProperty("_orientation"))
			this._axes.y._orientation = "left";

		if (this._coord.flip()) {
			var xOrient,
				yOrient;

			if (this._axes.hasOwnProperty("x"))
				xOrient = this._axes.x._orientation;
			if (this._axes.hasOwnProperty("y"))
				yOrient = this._axes.y._orientation;
			this._axes.x._orientation = yOrient;
			this._axes.y._orientation = xOrient;
		}

		for (var prop in this._axes) {
			if (!this._axes.hasOwnProperty(prop)) continue;

			var axis = this._axes[prop];

			// Remove axis if "none" is specified
			if(axis === "none") {
				this._g.selectAll(".axis-" + prop)
					.transition()
						.duration(this._duration)
					.style("opacity", 0)
					.remove();
				continue;
			} else {
				axis.chart(this)
					.scale(this._trainedScales[prop])
					.render(parent, labelContainer, bounds);
				bounds = axis.getPlotBounds(bounds);
				this.plotBounds(bounds);
			}
		}
	},

	_setRanges: function() {
		var bounds = this.plotBounds(),
			yScale = this.getTrainedScale('y'),
			xScale = this.getTrainedScale('x');

		// TODO: Just take a look and see if we can't avoid doing this multiple times
		var xRange = this.coord().flip() ? [bounds.bottom - bounds.top, 0] : [0, bounds.right - bounds.left],
			yRange = this.coord().flip() ? [0, bounds.right - bounds.left] : [bounds.bottom - bounds.top, 0];
		dv.util.scaleRange(xScale, xRange);
		dv.util.scaleRange(yScale, yRange);
	},

	plotBounds: function(val) {
		if (!arguments.length) return this._plotBounds;
		this._plotBounds = val;
		return this;
	},

	_renderLayers: function() {
		var bounds = this.plotBounds();
						
		var plotG = this._g.select('.plot'),
			plotGTransition = plotG;

		if (!this._firstRender) {
			plotGTransition = plotG.transition()
				.duration(this.duration())
				.delay(this.delay())
				.ease(this.ease());
		}
		plotGTransition.attr('transform', 'translate(' + bounds.left + ',' + bounds.top + ')');

		var draw = function(selection, self) {
			selection.attr('transform', 'translate(0,0)')
				.each(function(geom) {
					// flips are performed in the coord layer.
					dv.util.scaleRange(geom.getScale('y'), [bounds.bottom - bounds.top, 0]);
					dv.util.scaleRange(geom.getScale('x'), [0, bounds.right - bounds.left]);

					if (this.__previousData__ && 
							(this.__previousData__.dataPointStyleClass != geom.dataPointStyleClass)) {
						this.__previousData__.exit(this); // Clear out all elements from the prior geom.
					}
					geom.render(this);

					this.__previousData__ = geom;
				});
		};

		var exit = function(selection, self) {
			selection.each(function(geom) {
				geom.exit(this, function() {
					selection.remove();
				});
			});
		};

		// TODO: On exit, we should call the geom's render function and then have it perform an exit transition for the paths inside.
		var sel = plotG.selectAll(".geom").data(this._layers);
		sel.exit().call(exit, this);
		sel.enter().append("g").classed('geom', true);
		sel.call(draw, this);
	},

	_renderBehaviors: function() {
		var bounds = this.plotBounds();
		var behaviorContainer = this._g.select('.behavior')
			.attr('transform', 'translate(' + bounds.left + ',' + bounds.top + ')');

		this._interactionGroup.attr('transform', 'translate(' + bounds.left + ',' + bounds.top + ')');

		this._g.select('.interaction-canvas')
			.attr('visibility', 'hidden')
			//.attr('pointer-events', 'all')
			.attr('width', bounds.right - bounds.left)
			.attr('height', bounds.bottom - bounds.top);

		var self = this;
		_.each(this._behaviors, function(behavior) {
			behavior.chart(self).render(behaviorContainer);
		});
	},

	guide: function(property, guide) {
		// 1) check to make sure we have a valid property argument
		if (!property || property === "") throw new Error("Property argument cannot be null or empty");
		if (property === "all") {
			if(guide != "none") throw new Error("'all' can only be used to set all guides to 'none' (e.g. turn off all guides)");
			for (var i = 0; i < this._legends.length; i++) {
				this._legends[i].hide = true;
			}
			this._axes['x'] = "none";
			this._axes['y'] = "none";
		}

		// 2) if property arg isn't already in an array we want to wrap it to make life easier
		var pArray = _.isArray(property), gArray = _.isArray(guide);
		if (!pArray) property = [property];

		// 3) for each property we store a reference to the guide for rendering later
		for(var i = 0; i < property.length; i++) {
			var g = guide;
			// if no guide was given then we use the defaults
			if (!g) {
				g = (property[i] === 'x' || property[i] === 'y') ? dv.guide.axis() : dv.guide.legend();
			} else if (_.isFunction(g)) {
				// wrap custom functions as dv.guide.custom objects
				g = this._wrapGuideFunction(g);
			}
			if (this._isValidGuideType(property[i], g)) {
				if(property[i] === 'x' || property[i] === 'y') {
					this._axes[property[i]] = g;
				}
				else {
					if (g != "none") {
						this._legends.push({props: property, guide: g});
						break;
					}
				}
			}
		}
		return this;
	},

	_isValidGuideType: function(property, guide) {
		return guide && (guide === "none" || guide instanceof dv.guide.custom) ||
			((property === 'x' || property === 'y') && guide instanceof dv.guide.axis) ||
			((property != 'x' && property != 'y') && guide instanceof dv.guide.legend);
	},

	_wrapGuideFunction: function(guideFunc) {
		return dv.guide.custom().renderer(guideFunc);
	},

	hideGuides: function() {
		this._hideGuides = true;
		return this;
	},

	getScale: function(property) {
		if (property === 'group') return this.getGroup();
		if (this._aes.hasOwnProperty(property)) return this._aes[property];
	},

	getGroup: function() {
		// If a group has been explicitly defined, we're done.
		if (this._aes.hasOwnProperty('group')) return this._aes.group;

		// Otherwise, let's look for a categorical aesthetic which can serve as a grouping element.
		var i = -1,
			len = this.categoricalAes.length - 1;

		while (i++ < len) {
			var catAes = this._aes[this.categoricalAes[i]];
			// If the scale has a mapping (not a dv.scale.constant scale), we'll use it.
			if (catAes && !_.isUndefined(catAes.mapping())) return catAes;
		}
		return null;
	},

	// GETTERS / SETTERS

	// Returns a specific trained scale based on the required prop ('x', 'y', 'alpha', 'fill', 'stroke', etc)
	getTrainedScale: function(prop) {
		return this._trainedScales[prop];
	},

	parent: function(val) {
		if (!arguments.length) return this._parent ? this._parent.node() : null;
		this._parent = d3.select(val);
		if (this._parent.empty()) throw new Error("The DV parent element was not found.");
		return this;
	},

	layers: function(val) {
		if (!arguments.length) return this._layers;
		this._layers = val;
		return this;
	},

	behaviors: function(val) {
		if (!arguments.length) return this._behaviors;
		this._behaviors = val;
		return this;
	},

	data: function(val) {
		if (!arguments.length) return this._data;
		this._data = val;
		return this;
	},

	coord: function(val) {
		if (!arguments.length) return this._coord;
		this._coord = val;
		return this;
	},

	width: function(val) {
		if (!arguments.length) return this._width;
		this._width = val;
		return this;
	},

	height: function(val) {
		if (!arguments.length) return this._height;
		this._height = val;
		return this;
	},

	padding: function(val) {
		if (!arguments.length) return this._padding;
		this._padding = dv.util.merge(this._defaultPadding, val);
		return this;
	}
});
})();
