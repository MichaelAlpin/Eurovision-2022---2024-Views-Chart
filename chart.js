//API key - Insert your API key here to work
const APIKey = "";

//Expected screen size
const WIDTH = 1536;
const HEIGHT = 695;

//Entries count
const ENTRIES_COUNT = database.length;

//Container's size
const CONTAINER_FIXED_WIDTH = 1710;
const CONTAINER_FIXED_HEIGHT = 140;
const CONTAINER_SCALE = 0.25;

//Scroll tracking
let offsetY = 0;
let fixedOffsetY = 0;
const maxY = 280 + (ENTRIES_COUNT - Math.ceil((ENTRIES_COUNT - 30) / 3 * 2) - 20) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13) - HEIGHT / 3 * 2;

function onBodyLoad()
{
	//Load elements
	const canvas = document.querySelector("#canvas");
	const ctx = canvas.getContext("2d");
	
	//Set elements
	adjustCanvasSize(canvas, ctx);
	
	//Start action
	window.addEventListener('wheel', updateScroll);
	action(canvas, ctx);
}

async function action(canvas, ctx)
{
	//Get the ID of each video
	for(let i = 0; i < ENTRIES_COUNT; i++) {
		database[i].linkID = database[i].link.replace("https://www.youtube.com/watch?v=", "");
	}
	
	//Sort the entries by view count
	await updateChart();
	database.sort((entry1, entry2) => entry2.views - entry1.views);
	
	//Generate new Entry object
	let entries = [];
	for(let i = 0; i < ENTRIES_COUNT; i++) {
		entries.push(new Entry(database[i], i, ctx));
	}
	
	//Get date
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();
	
	//Get total views
	let total = 0;
	for(let i = 0; i < ENTRIES_COUNT; i++) {
		total += Number(database[i].views);
	}
	
	//Start animating
	animate(canvas, ctx, entries, total, dd + '/' + mm + '/' + yyyy);
}

function Entry(entryData, index, ctx)
{
	//Set Entry data
	this.artist = entryData.artist;
	this.song = entryData.song;
	this.country = entryData.country;
	this.views = entryData.views;
	this.index = index;
	this.flag = new Image();
	this.flag.src = "./images/flags/" + this.country.toLowerCase().replace(" ", "_") + ".png";
	this.winner = false;
	for(let i = 0; i < winningEntries.length; i++) {
		if(winningEntries[i].link == entryData.link) {
			this.winner = true;
		}
	}
	
	//Set position
	if(this.index < 30) {
		//Top 30
		if(this.index < 10) {
			this.x = (WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH / 2 * CONTAINER_SCALE;
			this.y = 190 + this.index * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		} else if(this.index < 20) {
			this.x = ((WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) * 2 - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2;
			this.y = 190 + (this.index - 10) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		} else {
			this.x = ((WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) * 3 - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2;
			this.y = 190 + (this.index - 20) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		}
	} else {
		//Not top 30
		if(this.index - 30 < (ENTRIES_COUNT - 30) / 3) {
			this.x = (WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH / 2 * CONTAINER_SCALE;
			this.y = 290 + (this.index - 20) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		} else if(this.index - 30 < (ENTRIES_COUNT - 30) / 3 * 2) {
			this.x = ((WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) * 2 - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2;
			this.y = 290 + (this.index - Math.ceil((ENTRIES_COUNT - 30) / 3) - 20) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		} else {
			this.x = ((WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4 + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) * 3 - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2;
			this.y = 290 + (this.index - Math.ceil((ENTRIES_COUNT - 30) / 3 * 2) - 20) * (CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 13);
		}
	}
	
	//Set text display
	if(this.views >= 100000000) {
		this.text = Math.floor(this.views / 1000000) + "M";
		this.viewsTextSize = 18;
	} else if(this.views >= 10000000) {
		this.text = Math.floor(this.views / 1000000) + "M";
		this.viewsTextSize = 21;
	} else if(this.views >= 1000000) {
		this.text = Math.floor(this.views / 100000) / 10 + "M";
		this.viewsTextSize = 20;
	} else if(this.views >= 10000) {
		this.text = Math.floor(this.views / 1000) + "K";
		this.viewsTextSize = 19;
		if(this.views < 100000) this.viewsTextSize = 24;
	} else if(this.views >= 1000) {
		this.text = Math.floor(this.views / 100) / 10 + "K";
		this.viewsTextSize = 22;
	} else {
		this.text = this.views;
		this.viewsTextSize = 25;
	}
	
	this.draw = (ctx, canvas) => {
		//Draw entry box
		ctx.fillStyle = "#3333ff";
		if(this.winner) ctx.fillStyle = "#cccc00";
		drawRoundedRect(prop(this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2, canvas),
					prop(this.y - offsetY, canvas),
					prop(CONTAINER_FIXED_WIDTH * CONTAINER_SCALE - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 26, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas), 
					prop(11, canvas), ctx, "fill");
		
		//Draw entry's views box
		ctx.fillStyle = "yellow";
		drawRoundedRect(prop(this.x + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 16, canvas),
					prop(this.y - offsetY, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 10, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(8, canvas), ctx, "fill");
		
		//Draw flag
		ctx.drawImage(this.flag,
						prop(this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 + 36, canvas),
						prop(this.y - offsetY + 5, canvas),
						prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 10, canvas),
						prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 10, canvas));
		
		//Draw flag border
		ctx.lineWidth = prop(2, canvas);
		ctx.strokeStyle = "black";
		drawRoundedRect(prop(this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 + 35, canvas),
					prop(this.y - offsetY + 4, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 8, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 8, canvas),
					prop(6, canvas), ctx, "stroke");
		
		ctx.fillStyle = "black";
		//Draw views count
		ctx.textAlign = "center";
		ctx.font = `${prop(this.viewsTextSize, canvas)}px Lilita One`;
		ctx.fillText(this.text,
					prop(this.x + CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 - 11, canvas),
					prop(this.y - offsetY + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 7, canvas));
		
		//Draw position
		ctx.font = `${prop((this.index < 99) ? 24 : 17, canvas)}px Roboto`;
		ctx.fillText(this.index + 1,
					prop(this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 34.5, canvas),
					prop(this.y - offsetY + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 8, canvas));
		
		//Draw entry's artist & song
		ctx.textAlign = "left";
		ctx.font = `${prop(24, canvas)}px Roboto`;
		ctx.fillText(this.artist + " - " + this.song,
					prop(this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 + 31 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(this.y - offsetY + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 8, canvas),
					prop(CONTAINER_FIXED_WIDTH * CONTAINER_SCALE - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE - 26 + this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 - (this.x - CONTAINER_FIXED_WIDTH * CONTAINER_SCALE / 2 + 31 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE) - 5, canvas));
	}
}

function animate(canvas, ctx, entries, total, date)
{
	function draw()
	{
		window.requestAnimationFrame(draw);
		adjustCanvasSize(canvas, ctx);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//Scroll tracking
		offsetY += (fixedOffsetY - offsetY) / 30;
		if(fixedOffsetY < 0) fixedOffsetY = fixedOffsetY / 10 * 9.5;
		if(fixedOffsetY > maxY) fixedOffsetY -= (fixedOffsetY - maxY) / 20;
		
		//Draw top 30 border
		ctx.strokeStyle = "#cccc00";
		ctx.lineWidth = prop(15, canvas);
		ctx.strokeRect(prop(40, canvas), prop(165 - offsetY, canvas), prop(WIDTH - 80, canvas), prop(515, canvas));
		
		//Draw title
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.font = `${prop(65, canvas)}px 'Lilita One'`;
		ctx.fillText("Eurovision 2022 - 2024 Views Chart", prop(WIDTH / 2, canvas), prop(85 - offsetY, canvas));
		
		//Draw entries
		for(let i = 0; i < ENTRIES_COUNT; i++) {
			entries[i].draw(ctx, canvas);
		}
		
		//Draw date
		ctx.fillStyle = "white";
		ctx.textAlign = "left";
		ctx.font = `${prop(30, canvas)}px 'Lilita One'`;
		ctx.fillText(date, prop((WIDTH - 3 * CONTAINER_FIXED_WIDTH * CONTAINER_SCALE) / 4, canvas), prop(138 - offsetY, canvas));
		
		//Draw total views
		//Container
		ctx.fillStyle = "#3333ff";
		drawRoundedRect(prop(260, canvas),
					prop(110 - offsetY, canvas),
					prop(82, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas), 
					prop(11, canvas), ctx, "fill");
		
		//Count container
		ctx.fillStyle = "yellow";
		drawRoundedRect(prop(385 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(110 - offsetY, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 26, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(8, canvas), ctx, "fill");
		
		ctx.fillStyle = "black";
		//'Total' text
		ctx.textAlign = "left";
		ctx.font = `900 ${prop(27, canvas)}px 'Roboto'`;
		ctx.fillText("Total",
					prop(270, canvas),
					prop(110 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 8 - offsetY, canvas));
		
		//Total views count
		ctx.textAlign = "center";
		ctx.font = `${prop(22, canvas)}px 'Lilita One'`;
		ctx.fillText(Math.floor(total / 100000000) / 10 + 'B',
					prop(398 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2, canvas),
					prop(117 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 - offsetY, canvas));
		
		//Draw average
		//Container
		ctx.fillStyle = "#3333ff";
		drawRoundedRect(prop(430, canvas),
					prop(110 - offsetY, canvas),
					prop(118, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas), 
					prop(11, canvas), ctx, "fill");
		
		//Count container
		ctx.fillStyle = "yellow";
		drawRoundedRect(prop(591 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(110 - offsetY, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE + 20, canvas),
					prop(CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE, canvas),
					prop(8, canvas), ctx, "fill");
		
		ctx.fillStyle = "black";
		
		//'Average' text
		ctx.textAlign = "left";
		ctx.font = `900 ${prop(27, canvas)}px 'Roboto'`;
		ctx.fillText("Average",
					prop(440, canvas),
					prop(110 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 + 8 - offsetY, canvas));
		
		//Average views count
		ctx.textAlign = "center";
		ctx.font = `${prop(20, canvas)}px 'Lilita One'`;
		ctx.fillText(Math.floor(total / ENTRIES_COUNT / 100000) / 10 + 'M',
					prop(601 - CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2, canvas),
					prop(117 + CONTAINER_FIXED_HEIGHT * CONTAINER_SCALE / 2 - offsetY, canvas));
		
		//Draw scroll instruction
		ctx.fillStyle = "white";
		ctx.textAlign = "left";
		ctx.font = `${prop(35, canvas)}px 'Lilita One'`;
		ctx.fillText("Scroll to navigate", prop(1200, canvas), prop(138 - offsetY, canvas));
	}
	
	draw();
}
