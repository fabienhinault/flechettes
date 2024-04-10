
function Round(last)
{
	if(last){
		this.n = last.n + 1;
		this.m_dSlowSpeed = last.m_dSlowSpeed + 3/1000;
		var limRad = 20;
		this.m_dRadFast = limRad + ((last.m_dRadFast - limRad) * 0.80);
	}
	else
	{
		this.n = 1;
		this.m_dSlowSpeed = 35/1000; // in pixels/millisecond
		this.m_dRadFast = 100; // in pixels. If dog is nearer, go fast.
	}
	this.won = undefined;
	document.getElementById("round").innerHTML = this.n;
}



function randomDir()
{
    var dir = Math.random() * 2 * Math.PI;
    dx = Math.cos(dir);
    dy = Math.sin(dir);
    return new Array(dx,dy);
}

function Planet(x, y, div){
	this.m_Dir = randomDir();
    this.last_x = x;
    this.last_y = y;
	this.m_x = x;
	this.m_y = y;
    this.speed_x = this.m_Dir[0] / 10;
    this.speed_y = this.m_Dir[1] / 10;
	this.m_div = div;
	this.draw();
}
Planet.m_side = 5; // display square edge
Planet.m_side_2 = Planet.m_side / 2;
Planet.m_dFastSpeed = 100/1000; // in pixels/millisecond

Planet.prototype.move = function(elapsedTime) {
    this.m_x += this.speed_x * elapsedTime;
    this.m_y += this.speed_y * elapsedTime;
    let [force_x, force_y] = [0, 0];
    for (const otherPlanet of g_aPlanet) {
        if (otherPlanet !== this) {
            const dx = - this.m_x + otherPlanet.last_x;
            const dy = - this.m_y + otherPlanet.last_y;
            const distance2 = dx * dx + dy * dy;
            const distance = Math.sqrt(distance2);
            force_x += dx / distance2 / distance;
            force_y += dy / distance2 / distance;
        }
    }
    this.speed_x += force_x * elapsedTime;
    this.speed_y += force_y * elapsedTime;
};

Planet.prototype.updateLast = function() {
    this.last_x = this.m_x;
    this.last_y = this.m_y;
}

Planet.prototype.draw = function()
{
	this.m_div.style.left = Math.round(this.m_x - Planet.m_side_2) + 'px';;
	this.m_div.style.top = Math.round(this.m_y - Planet.m_side_2) + 'px';
};

g_nWidthDiv = 0;
g_nHeightDiv = 0;
g_nLeftDiv = 0;
g_nTopDiv = 0;

Planet.prototype.isOut = function()
{
	var out =  (this.m_x < g_nLeftDiv || this.m_x > g_nLeftDiv + g_nWidthDiv ||
			this.m_y < g_nTopDiv || this.m_y > g_nTopDiv + g_nHeightDiv);
	if(out)
	{
		this.m_div.style.background = 'rgb(255, 0, 0)';
	}
	return out;
};

g_aPlanet = new Array();
g_handlerTimeout = 0;
g_timeLastMove = 0;
g_delay = 40;

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

function start()
{
	g_Div = document.getElementById("bigdiv");
    g_nHeightDiv = g_Div.clientHeight;
    g_nWidthDiv = g_Div.clientWidth;
    g_posDiv = findPos(g_Div);
    g_nLeftDiv = g_posDiv[0];
    g_nTopDiv = g_posDiv[1];
    
    g_round = new Round();
    
    restart();
    
    g_handlerTimeout = setTimeout("update();", g_delay);
	g_timeLastMove = (new Date()).getTime();
}

function removeAll(cell){
	if ( cell.hasChildNodes() )
	{
	    while ( cell.childNodes.length >= 1 )
	    {
	        cell.removeChild( cell.firstChild );       
	    } 
	}
}

function restart(){
    removeAll(g_Div);
    createPlanet( g_nLeftDiv + g_nWidthDiv * 0.25, g_nTopDiv + g_nHeightDiv * 0.5, 0, 0.04); 
    createPlanet( g_nLeftDiv + g_nWidthDiv * 0.75, g_nTopDiv + g_nHeightDiv * 0.5, 0, -0.04); 
    createPlanet( g_nLeftDiv + g_nWidthDiv * 0.5, g_nTopDiv, 0, 0.04); 

}

function createPlanet(x, y, speedX, speedY) {
    const div = createLittleDiv(x, y);
    let planet = new Planet(x, y, div);
    planet.speed_x = speedX;
    planet.speed_y = speedY;
    g_aPlanet.push(planet);
    g_Div.appendChild(div);
}


function createLittleDiv(x, y) {
	    var littleDiv = document.createElement('div');
	    littleDiv.style.background = 'rgb(255, 255, 255)';
	    littleDiv.style.width = '5px';
	    littleDiv.style.height = '5px';
	    littleDiv.style.left = x - 2.5 + 'px';;
	    littleDiv.style.top = y - 2.5 + 'px';
	    littleDiv.style.position = 'absolute';
    return littleDiv;
}

function averageSpeeds() {
    let sumSpeedX = 0;
    let sumSpeedY = 0;
    for(const planet of g_aPlanet) {
        sumSpeedX += planet.speed_x;
        sumSpeedY += planet.speed_y;
    }
    let avgSpeedX = sumSpeedX / g_aPlanet.length;
    let avgSpeedY = sumSpeedY / g_aPlanet.length;
    for(const planet of g_aPlanet) {
        planet.speed_x -= avgSpeedX;
        planet.speed_y -= avgSpeedY;
    }
}


function isFinished()
 {
	if (typeof (g_round.won) != "undefined") {
		return true;
	}
	var min_x = g_nLeftDiv + g_nWidthDiv;
	var min_y = g_nTopDiv + g_nHeightDiv;
	var max_x = 0;
	var max_y = 0;
	for ( var iPlanet in g_aPlanet) {
		if (g_aPlanet[iPlanet].isOut()) {
			if(typeof (g_round.won) == "undefined") {
				g_round.won = false;
				g_Div.attributes.removeNamedItem("onmousemove");
				updateMouseMove = function() {};
				return true;
			}
		}
		if (g_aPlanet[iPlanet].m_x < min_x) {
			min_x = g_aPlanet[iPlanet].m_x;
		}
		if (g_aPlanet[iPlanet].m_y < min_y) {
			min_y = g_aPlanet[iPlanet].m_y;
		}
		if (g_aPlanet[iPlanet].m_x > max_x) {
			max_x = g_aPlanet[iPlanet].m_x;
		}
		if (g_aPlanet[iPlanet].m_y > max_y) {
			max_y = g_aPlanet[iPlanet].m_y;
		}
	}
	var won_distance = 20;
	if ((max_x - min_x) < won_distance && (max_y - min_y < won_distance)) {
		if (typeof (g_round.won) == "undefined") {
			g_round = new Round(g_round);
			restart();
		}
	}
	return false;
}

function update()
{

//  if(isFinished())
//  {
//     return;
//  }
  clearTimeout(g_handlerTimeout);
  g_handlerTimeout = setTimeout("update();", g_delay);
  var time = (new Date()).getTime();
  var elapsedTime = time - g_timeLastMove;
  g_timeLastMove = time;
  for(iPlanet = 0; iPlanet < g_aPlanet.length; iPlanet++)
  {
    g_aPlanet[iPlanet].move(elapsedTime);
        g_aPlanet[iPlanet].draw();
  }
  for(iPlanet = 0; iPlanet < g_aPlanet.length; iPlanet++)
  {
     g_aPlanet[iPlanet].updateLast();
  }

}

