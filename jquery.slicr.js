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
			onFinish: function() {}
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
			var newSlices = plugin.getSlices(slice);
			var extraLevel = Math.round(Math.random());

			this.level++;

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

			this.level--;

			// append new slices
			slice.append(newSlices);
		},

		// calculate new slices
		getSlices: function(slice) {

			var plugin = this;

			var ratio = slice.width() / slice.height();
			var slices = new Array(plugin.settings.amount);
			var values = this.getValues();

			$.each(slices, function(index) {

				// create new slice
				var slice = $(document.createElement(plugin.settings.elementName));
				slice.addClass(plugin.settings.sliceClass);
				slice.css('float', 'left');

				// landscape
				if(ratio >= 1) {
					slice.css('width', values[index] + '%');
					slice.css('height', '100%');
				}

				// portrait
				else {
					slice.css('width', '100%');
					slice.css('height', values[index] + '%');
				}

				// assign new slice
				slices[index] = slice;
			});

			return slices;
		},

		// get values for the slicing
		getValues: function() {

			var ratio;
			var values = new Array;

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

			var result = 100 / ratio;
			var rest = 100 - result;

			values.push(result, rest);

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
