//Draw a rounded [x,y,width,height] rectangle with a [radius] radius
function drawRoundedRect(x, y, width, height, radius, ctx, method) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + width, y, x + width, y + height, radius);
	ctx.arcTo(x + width, y + height, x, y + height, radius);
	ctx.arcTo(x, y + height, x, y, radius);
	ctx.arcTo(x, y, x + width, y, radius);
	ctx.closePath();
	if(method == "fill") {
		ctx.fill();
	}
	else if(method == "stroke") {
		ctx.stroke();
	}
}

//Scroll tracking
function updateScroll(event)
{
	fixedOffsetY += Math.sign(event.deltaY) * 160;
}

//Get value proportional to the computer screen size
function prop(num, canvas)
{
	return num / HEIGHT * canvas.height;
}

//Get using the YouTube API the view count of every video in the database and store it there
async function updateChart()
{
	//Create an array to store all the fetch promises
	const fetchPromises = [];
	
	for(let i = 0; i < ENTRIES_COUNT; i++) {
		if(database[i].link == "None") {
			database[i].views = 0;
			continue;
		}
		fetchPromises.push(
			fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${database[i].linkID}&key=${APIKey}`)
				.then(response => {
					return response.json()
				})
				.then(data => {
					database[i].views = data["items"][0].statistics.viewCount;
				})
		);
	}
	
	//Wait for all fetch promises to resolve
	await Promise.all(fetchPromises);
}

//Make the canvas fit the screen while keeping a constant width:height ratio
function adjustCanvasSize(canvas, ctx)
{
	canvas.width = window.innerWidth * window.devicePixelRatio;
	canvas.height = window.innerHeight * window.devicePixelRatio;
	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	canvas.style.width = `${window.innerWidth}px`;
	canvas.style.height = `${window.innerHeight}px`;
	if(canvas.width / canvas.height > WIDTH / HEIGHT) {
		canvas.height = window.innerHeight * window.devicePixelRatio;
		canvas.width = canvas.height * WIDTH / HEIGHT;
		canvas.style.width = `${window.innerHeight * WIDTH / HEIGHT}px`;
		canvas.style.height = `${window.innerHeight}px`;
	} else {
		canvas.width = window.innerWidth * window.devicePixelRatio;
		canvas.height = canvas.width / WIDTH * HEIGHT;
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerWidth / WIDTH * HEIGHT}px`;
	}
}
