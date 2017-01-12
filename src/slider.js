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
		this.ANIMATION_SPEED = options.animationSpeed || 500;

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
		this.produceCarouselOffsetOnResize();

		var thumbOffset = this.calcThumbOffsetByCarouselOffset(this.currentOffset);
		this.lastWrapperWidth = this.wrapper.width();

		this.moveThumb(thumbOffset);
	}

	LightCarousel.prototype.produceCarouselOffsetOnResize = function() {
		// When we should move carousel?
		// 1) If carousel width > wrapper width:
		//  - If current offset was positive -> set offset = 0
		//  - When we hit the right border of carousel -> increase offset on resize length
		// 2) If carousel width < wrapper width:
		//  - If current offset was negative -> set offset = 0
		//  - If current offset was positive:
		//    - If wrapper became smaller -> decrease offset on resize length (untill it become 0)

		var offset;

		if (this.carousel.width() > this.wrapper.width()) {

			if (this.currentOffset > 0) {
				this.moveCarousel(0);
			} else if (this.wrapper.width() - this.currentOffset > this.carousel.width()) {
				offset = this.calcCarouselOffsetOnResize();
				this.moveCarousel(offset);
			}

		} else {

			if (this.currentOffset < 0) {
				this.moveCarousel(0);
			} else {
				if (this.lastWrapperWidth > this.wrapper.width()) {
					offset = this.calcCarouselOffsetOnResize();

					if (offset > 0) {
						this.moveCarousel(offset);
					} else {
						this.moveCarousel(0);
					}

				}
			}

		}

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
		var percent;

		if (offset > 0) {
			percent = Math.floor( (offset) / (this.wrapper.width() - this.carousel.width()) * 100 ) / 100;
		} else {
			percent = Math.floor( -offset / ( Math.abs( this.carousel.width() - this.wrapper.width() ) ) * 100 ) / 100;
		}

		var pos = Math.floor( (this.thumbTrack.width() - this.thumb.width()) * percent );
		return pos;
	}

	LightCarousel.prototype.calcThumbPercentPosition = function() {
		return Math.floor( this.currentThumbOffset / ( this.thumbTrack.width() - this.thumb.width() ) * 100 ) / 100;
	}

	LightCarousel.prototype.calcCarouselOffsetOnResize = function() {
		return this.currentOffset + this.wrapper.width() - this.lastWrapperWidth;
	}

	// ANIMATORS

	LightCarousel.prototype.animateButtonOffset = function(carouselOffset, thumbOffset) {
		if ( carouselOffset !== this.currentOffset ) {
			this.carousel.animate({
				left: carouselOffset
			}, this.ANIMATION_SPEED);

			this.animateThumbMovement(thumbOffset);

			this.currentOffset = carouselOffset;
		} else {
			if (carouselOffset === 0) {
				this.carousel
					.animate({ left: "+=40" }, this.ANIMATION_SPEED / 2)
					.animate({ left: "-=40" }, this.ANIMATION_SPEED / 2);
			} else {
				this.carousel
					.animate({ left: "-=40" }, this.ANIMATION_SPEED / 2)
					.animate({ left: "+=40" }, this.ANIMATION_SPEED / 2);
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
		this.thumb.animate( {left : offset}, this.ANIMATION_SPEED );
		this.currentThumbOffset = offset;
	}

	LightCarousel.prototype.moveThumb = function(offset) {
		this.thumb.css('left', offset);
		this.currentThumbOffset = offset;
	}

	return LightCarousel;
}));
