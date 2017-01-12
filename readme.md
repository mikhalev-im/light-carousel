# Light carousel
Depends on jQuery (look at demo)
## Usage example:

```
var selectors = {
	collectionWrapper: 'ul',
	leftBtn: '.lc-arrow-left',
	rightBtn: '.lc-arrow-right',
	scrollbarTrack: '.scrollbar-track'
}

var wrapper = $('#carousel');
var lc = new LightCarousel(wrapper, selectors);
lc.setup();
```

## Example html markup:

```
// general wrapper
<div id="carousel">
	// collection wrapper
	<ul>
		// here goes your items
		<li></li>
	</ul>

	// control buttons
	<a href="#" class="lc-arrow-left lc-arrow"> < </a>
	<a href="#" class="lc-arrow-right lc-arrow"> > </a>

	//scrollbar
	<span class="scrollbar-track">
		<span class="scrollbar-thumb"></span>
	</span>
</div>
```
