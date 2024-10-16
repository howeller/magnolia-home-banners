/*
*	@version: 0.0.0
*	@author: 	howeller, eric@howellstudio.com
*	@desc: 		Helpful Handlebars.js functions for getting image info
*/
const	sizeOf = require('image-size'),
	path = require('path');

module.exports = { getImgProps, getImgSize, getImgWidth };

/*
*	Helper that returns image property (width or height)
*	
*	background-size:{{getImgSize 't1.png' 'width'}}px {{getImgSize 't1.png' 'height'}}px;
*/

function getImgSize(imgPath='./images/', img, prop) {
	let _img = imgPath+img,// CHANGE imgPATH TO ARRAY THEN TEST IF FILE IS AT CORRECT PATH
		dimensions = sizeOf(_img);
		// name =  path.parse(img).name,
		// is2x = true;//name.endsWith('2x'), // Check to see if name indicates @2x image.

	return dimensions[prop];
	// return is2x ? Math.ceil(dimensions[prop]/2) : dimensions[prop];
}

/*
*	Returns image width
*	
*	<img srcset = "images/t1.png {{getImgWidth 't1.png'}}w" >
*/

function getImgWidth(imgPath='./images/', img) {
	let _img = imgPath+img;
	return sizeOf(_img).width;
}

/*
*	Blocker helper that returns image width, height, & extension
*	
*	{{#getImgProps}}{{log this.width this.height}}{{/getImgProps}}
*/

function getImgProps(imgPath='./images/', img, options) {
	let _img = imgPath+img,// CHANGE imgPATH TO ARRAY THEN TEST IF FILE IS AT CORRECT PATH
		dimensions = sizeOf(_img),
		// name =  path.parse(img).name,
		is2x = true,//name.endsWith('2x'), // Check to see if name indicates @2x image.
		obj = {
			'file' : img,
			'width' : is2x ? Math.ceil(dimensions.width/2) : dimensions.width,
			'height': is2x ? Math.ceil(dimensions.height/2) : dimensions.height,
			'ext' : dimensions.type
		};
	return options.fn(obj);
}