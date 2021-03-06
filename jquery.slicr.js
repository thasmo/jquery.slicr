;(function($, window, document, undefined) {

	// Create the defaults once
	var pluginName = 'slicr',
	    defaults = {

			// settings
			elementName: 'div',
			sliceClass: 'slice',
			contentClass: 'slice-content',
			algorithm: 'goldenRatio', // equal | goldenRatio | narrow | wide
			amount: 2,
			levels: 4,

			// callbacks
			onFinish: function() {},
			beforeSlicing: function(slice, level) {},
			afterSlicing: function(slice, slices, level) {},

			// overrides
			appendSlices: null
	    };

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype = {

		level: 0,

		// initialize the plugin
		init: function() {
			this.buildSlices($(this.element));
			this.settings.onFinish();
		},

		// build all slices
		buildSlices: function(slice) {

			var plugin = this;
			var extraLevel = Math.round(Math.random());
			var newSlices;

			// increase level
			this.level++;

			// call before slicing callback
			this.settings.beforeSlicing(slice, this.level);

			// get new slices
			newSlices = plugin.getSlices(slice, plugin.settings.amount);

			// call after slicing callback
			this.settings.afterSlicing(slice, newSlices, this.level);

			// going in, MORE slices!
			if(this.level < (this.settings.levels + extraLevel)) {
				$.each(newSlices, function(index) {
					plugin.buildSlices($(newSlices[index]));
				});
			}

			// going out, NO MORE slices!
			else {
				$.each(newSlices, function(index) {
					$(newSlices[index]).addClass(plugin.settings.contentClass);
				});
			}

			// append new slices
			if(typeof this.settings.appendSlices == 'function') {
				this.settings.appendSlices(slice, newSlices, this.level);
			} else {
				slice.append(newSlices);
			}

			// decrease level
			this.level--;
		},

		// calculate new slices
		getSlices: function(slice, number) {

			var plugin = this;

			var width = slice.data('width') || slice.width();
			var height = slice.data('height') || slice.height();
			var ratio = slice.data('ratio') || width / height;

			var values = this.getValues(number);
			var slices = new Array(number);

			$.each(slices, function(index) {

				// create new slice
				var slice = $(document.createElement(plugin.settings.elementName));
				slice.addClass(plugin.settings.sliceClass);

				// landscape
				if(ratio >= 1) {
					slice.css('float', (number == index + 1) ? 'right' : 'left');
					slice.css('width', values[index] + '%');
					slice.css('height', '100%');

					slice.data('width', width * values[index] / 100);
					slice.data('height', height);
				}

				// portrait
				else {
					slice.css('float', 'left');
					slice.css('width', '100%');
					slice.css('height', values[index] + '%');

					slice.data('width', width);
					slice.data('height', height * values[index] / 100);
				}

				// add more data
				slice.data('ratio', slice.data('width') / slice.data('height'));

				// assign new slice
				slices[index] = slice;
			});

			return slices;
		},

		// get values for the slicing
		getValues: function(number) {

			var ratio;
			var values = new Array(number);

			var major;
			var minor;

			switch(this.settings.algorithm) {

				default:
				case 'equal':
					ratio = 2;
				break;

				case 'goldenRatio':
					ratio = 1.618;
				break;

				case 'wide':
					ratio = 1.777;
				break;

				case 'narrow':
					ratio = 1.333;
				break;
			}

			// generate values
			$.each(values, function(index) {

				total = major || 100;

				major = total / ratio;
				minor = total - major;

				values[index] = minor;

				if(values.length == index + 2) {
					values[index + 1] = major;
					return false;
				}

				return true;
			});

			return this.shuffle(values);
		},

		// shuffle array
		// borrowed from sugar.js FTW!
		shuffle: function(array) {
			var arr = array.concat(), i = arr.length, j, x;

			while(i) {
				j = (Math.random() * i) | 0;
				x = arr[--i];
				arr[i] = arr[j];
				arr[j] = x;
			}

			return arr;
		}
	};

	// A really lightweight plugin wrapper around the constructor
	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery, window, document);
