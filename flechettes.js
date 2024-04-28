
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
    let gravity = true;
    this.m_x += this.speed_x * elapsedTime;
    this.m_y += this.speed_y * elapsedTime;
    let [force_x, force_y] = [0, 0];
    for (const otherPlanet of g_aPlanet) {
        if (otherPlanet !== this) {
            const dx = - this.m_x + otherPlanet.last_x;
            const dy = - this.m_y + otherPlanet.last_y;
            const distance2 = dx * dx + dy * dy;
            const distance = Math.sqrt(distance2);
            if (distance < 10) {
                console.debug(distance);
            }
            if (distance < 5) {
                gravity = false;
                const dirDX = dx / distance;
                const dirDY = dy / distance;
                const dotSpeedDir = this.speed_x * dirDX + this.speed_y * dirDY;
                const speedDirDX = dotSpeedDir * dirDX;
                const speedDirDY = dotSpeedDir * dirDY;
                this.speed_x -= 2 * speedDirDX;
                this.speed_y -= 2 * speedDirDY;
                break;
            }
            force_x += dx / distance2 / distance;
            force_y += dy / distance2 / distance;
        }
    }
    if (gravity) {
        this.speed_x += force_x * elapsedTime;
        this.speed_y += force_y * elapsedTime;
    }
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

let g_aPlanet = new Array();
let g_handlerTimeout = 0;
let g_timeLastMove = 0;
const g_delay = 40;
let dart;

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
    const v = 0.03; //0.04 for a circle
    createPlanet( g_nLeftDiv + g_nWidthDiv * 0.5, g_nTopDiv + g_nHeightDiv * 0.25, v, 0); 
    createPlanet( g_nLeftDiv + g_nWidthDiv * 0.5, g_nTopDiv + g_nHeightDiv * 0.75, -v, 0); 
    const xDart = g_nLeftDiv;
    const yDart = g_nTopDiv  + g_nHeightDiv * 0.5;
    const dartDiv = createLittleDiv(xDart, yDart);
    dartDiv.style.background = 'rgb(255, 0, 0)'
    dart = new Planet(xDart, yDart, dartDiv);
    dart.speed_x = v;
    dart.speed_y = 0;
    g_Div.appendChild(dartDiv);
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

function update()
{
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

function addDart(evt) {
    g_aPlanet.push(dart);
    document.removeEventListener('keypress', addDart);
}

document.addEventListener('keypress', addDart);

