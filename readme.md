# Light carousel
Light-weight Amazon-like carousel based on jQuery!

## Demo:
<a href="https://c1one-38.github.io/light-carousel/">https://c1one-38.github.io/light-carousel/</a>

## Usage example:

Easy as:

```js
var lc = new LightCarousel($('#carousel'));
lc.setup();
```

## Example html markup:

```html
<head>
	...

	<!-- Add lib style to your page -->
	<link rel="stylesheet" type="text/css" href="css/styles.css">

	...
</head>

<body>
...

	<div id="carousel" class="lc-wrapper">
		<ul class="lc-carousel">
			<!-- Here goes your items -->
			<li class="lc-carousel-item"></li>
		</ul>

		<!-- Controll buttons -->
		<a href="#" class="lc-arrow-left lc-arrow"> < </a>
		<a href="#" class="lc-arrow-right lc-arrow"> > </a>

		<!-- Scrollbar -->
		<span class="lc-scrollbar">
			<span class="lc-scrollbar-track">
				<span class="lc-scrollbar-thumb"></span>
			</span>
		</span>
	</div>

...
</body>
```

## Options:

Feel free to pass your own selectors for carousel elements or animation speed as second argument. Below you see default values:

```js
defaultOptions = {
	animationSpeed: 500,
	selectors: {
		collectionWrapper: 'ul',
		leftBtn: '.lc-arrow-left',
		rightBtn: '.lc-arrow-right',
		scrollbarTrack: '.lc-scrollbar-track'
	}
}

new LightCarousel($('#carousel'), defaultOptions);
```

## Destroy:

```js
lc.destroy();
```
