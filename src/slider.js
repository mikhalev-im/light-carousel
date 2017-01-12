(function(root, factory) {
	if(typeof define === "function" && define.amd) {
		define(["jQuery"], function(jQuery){
			return (root.LightCarousel = factory(jQuery));
		});
	} else if(typeof module === "object" && module.exports) {
		module.exports = (root.LightCarousel = factory(require("jQuery")));
	} else {
		root.LightCarousel = factory(root.jQuery);
	}
}(this, function($) {
	function LightCarousel(wrapper, options) {
		this.options = options;

		// ELEMENTS
		if (wrapper instanceof $) {
			this.wrapper = wrapper;
		} else {
			this.wrapper = $(wrapper);
		}

		this.carousel = this.wrapper.find(options.collectionWrapperSelector);
		this.collection = this.carousel.children();

		this.leftArrow = this.wrapper.find(options.leftBtnSelector);
		this.rightArrow = this.wrapper.find(options.rightBtnSelector);


		this.thumbTrack = this.wrapper.find(options.scrollbarTrackSelector);
		this.thumb = this.thumbTrack.children();

		// STATE
		this.currentOffset = 0;
		this.currentThumbOffset = 0;
		this.lastWrapperWidth = this.wrapper.width();
	}

	// SETUP PART

	LightCarousel.prototype.setup = function() {
		this.setupStyles();
		this.bindListeners();
	}

	LightCarousel.prototype.setupStyles = function() {
		this.wrapper.css('overflow', 'hidden');
		this.wrapper.css('white-space', 'nowrap');

		this.carousel.css('position', 'relative');
		this.carousel.css('left', '0px');
		this.carousel.css('display', 'inline-block');
		// to remove space between inline-block
		this.carousel.css('word-spacing', '-.36em');

		this.collection.css('display', 'inline-block');

		this.thumbTrack.css('position', 'relative');
		this.thumb.css('position', 'absolute');
		this.thumb.css('left', '0px');
	}

	LightCarousel.prototype.bindListeners = function() {
		this.leftArrow.on('click', $.proxy(this.produceButtonOffset, this));
		this.rightArrow.on('click', $.proxy(this.produceButtonOffset, this));
		this.thumb.on('mousedown', $.proxy(this.produceScrollbarOffset, this));

		$(window).on('resize', $.proxy(this.handleResize, this));
	}

	// LISTENERS

	LightCarousel.prototype.produceButtonOffset = function(e) {
		if ( this.carousel.is(':animated') ) {
			return;
		}

		var carouselOffset = 0,
			thumbOffset = 0;

		if ( $(e.currentTarget).hasClass('lc-arrow-left') ) {
			carouselOffset = this.calcLeftOffset();
		} else {
			carouselOffset = this.calcRightOffset();
		}

		thumbOffset = this.calcThumbOffsetByCarouselOffset(carouselOffset);

		this.animateButtonOffset(carouselOffset, thumbOffset);
	}

	LightCarousel.prototype.produceScrollbarOffset = function(eDown) {
		var self = this,
			thumbCursorOffset = eDown.pageX - this.wrapper.offset().left - this.currentThumbOffset;

		$(document).on('mousemove', function(eMove) {
			var position = eMove.pageX - self.wrapper.offset().left - thumbCursorOffset;

			self.changeThumbPosition(position);

			var percent = self.calcThumbPercentPosition();
			var carouselOffset = self.calcCarouselOffsetByPercent(percent);

			self.moveCarousel(carouselOffset);
		});

		$(document).on('mouseup', function() {
			$(document).off('mousemove mouseup');
		});
	}

	LightCarousel.prototype.handleResize = function(e) {
		if (this.wrapper.width() - this.currentOffset > this.carousel.width()) {
			var offset = this.currentOffset + this.wrapper.width() - this.lastWrapperWidth;
			this.moveCarousel(offset);
		}

		this.lastWrapperWidth = this.wrapper.width();

		var thumbOffset = this.calcThumbOffsetByCarouselOffset(this.currentOffset);
		this.moveThumb(thumbOffset);
	}

	// CALCULATIONS

	LightCarousel.prototype.calcLeftOffset = function() {
		var intersection = this.currentOffset + this.wrapper.width(),
			offset = 0,
			currentOffset = this.currentOffset;

		if (intersection >= 0) {
			return offset;
		}

		this.collection.each(function() {
			offset -= this.offsetWidth;

			if (offset <= intersection) {
				// if intersection points to the same element
				if (offset === currentOffset) {
					offset += this.offsetWidth
				}

				return false;
			}
		});

		return offset;
	}

	LightCarousel.prototype.calcRightOffset = function() {
		var intersection = 2 * this.wrapper.width() - this.currentOffset,
			offset = 0,
			currentOffset = this.currentOffset;

		if (intersection >= this.carousel.width()) {
			return this.wrapper.width() - this.carousel.width();
		}

		intersection = this.currentOffset - this.wrapper.width();

		this.collection.each(function() {
			offset -= this.offsetWidth;

			if (offset <= intersection) {
				if (offset + this.offsetWidth !== currentOffset) {
					offset += this.offsetWidth;
				}

				return false;
			}
		});

		return offset;
	}

	LightCarousel.prototype.calcCarouselOffsetByPercent = function(percent) {
		return - Math.floor( ( this.carousel.width() - this.wrapper.width() ) * percent );
	}

	LightCarousel.prototype.calcThumbOffsetByCarouselOffset = function(offset) {
		var percent = Math.floor( -offset / ( this.carousel.width() - this.wrapper.width() ) * 100 ) / 100;
		var pos = Math.floor( (this.thumbTrack.width() - this.thumb.width()) * percent );
		return pos;
	}

	LightCarousel.prototype.calcThumbPercentPosition = function() {
		return Math.floor( this.currentThumbOffset / ( this.thumbTrack.width() - this.thumb.width() ) * 100 ) / 100;
	}

	// ANIMATORS

	LightCarousel.prototype.animateButtonOffset = function(carouselOffset, thumbOffset) {
		if ( carouselOffset !== this.currentOffset ) {
			this.carousel.animate({
				left: carouselOffset
			}, 500);

			this.animateThumbMovement(thumbOffset);

			this.currentOffset = carouselOffset;
		} else {
			if (carouselOffset === 0) {
				this.carousel
					.animate({ left: "+=40" }, 250)
					.animate({ left: "-=40" }, 250);
			} else {
				this.carousel
					.animate({ left: "-=40" }, 250)
					.animate({ left: "+=40" }, 250);
			}
		}
	}

	LightCarousel.prototype.changeThumbPosition = function(position) {
		if (position < 0) {
			this.moveThumb(0);
		} else if (position > this.thumbTrack.width() - this.thumb.width()) {
			position = this.thumbTrack.width() - this.thumb.width();
			this.moveThumb(position)
		} else {
			this.moveThumb(position)
		}
	}

	LightCarousel.prototype.moveCarousel = function(offset) {
		this.carousel.css('left', offset);
		this.currentOffset = offset;
	}

	LightCarousel.prototype.animateThumbMovement = function(offset) {
		this.thumb.animate( {left : offset}, 500 );
		this.currentThumbOffset = offset;
	}

	LightCarousel.prototype.moveThumb = function(offset) {
		this.thumb.css('left', offset);
		this.currentThumbOffset = offset;
	}

	return LightCarousel;
}));
