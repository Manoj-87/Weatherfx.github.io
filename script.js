/* API KEY */
const apiKey = "3438e84f46d025f18d2e43fce7279ffb";

/* ELEMENTS */
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locBtn = document.getElementById("locBtn");

const weatherBox = document.getElementById("weatherBox");
const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const detailsEl = document.getElementById("details");
const iconEl = document.getElementById("icon");
const errorEl = document.getElementById("error");

/* CANVAS SETUP */
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

/* PARTICLES */
let mode = "clear";
let particles = [];

class Particle {
  constructor(type) {
    this.type = type;
    this.reset();
  }

  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;

    if (this.type === "rain") {
      this.speed = 8 + Math.random() * 6;
      this.len = 15 + Math.random() * 20;
    }

    if (this.type === "snow") {
      this.speed = 1 + Math.random() * 2;
      this.size = 2 + Math.random() * 3;
    }

    if (this.type === "fog") {
      this.speed = 0.3;
      this.size = 80 + Math.random() * 100;
    }
  }

  update() {
    if (this.type === "rain") {
      this.y += this.speed;
      if (this.y > H) this.reset();
    }

    if (this.type === "snow") {
      this.y += this.speed;
      this.x += Math.sin(this.y * 0.01);
      if (this.y > H) this.reset();
    }

    if (this.type === "fog") {
      this.x += this.speed;
      if (this.x > W + 200) this.reset();
    }
  }

  draw() {
    if (this.type === "rain") {
      ctx.strokeStyle = "#60a5fa";
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + this.len);
      ctx.stroke();
    }

    if (this.type === "snow") {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.type === "fog") {
      ctx.fillStyle = "rgba(255,255,255,.03)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* SET EFFECT */
function setFX(type) {
  mode = type;
  particles = [];

  if (type === "rain") {
    for (let i = 0; i < 200; i++) particles.push(new Particle("rain"));
    document.body.style.background = "#020617";
  }

  if (type === "snow") {
    for (let i = 0; i < 120; i++) particles.push(new Particle("snow"));
    document.body.style.background = "#0f172a";
  }

  if (type === "fog") {
    for (let i = 0; i < 30; i++) particles.push(new Particle("fog"));
    document.body.style.background = "#334155";
  }

  if (type === "clear") {
    particles = [];
    document.body.style.background =
      "linear-gradient(#60a5fa,#38bdf8)";
  }
}

/* LOOP */
function animate() {
  ctx.clearRect(0, 0, W, H);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();

/* FETCH WEATHER */
async function fetchData(q) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${q}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();

    showWeather(data);
  } catch {
    errorEl.innerText = "City not found";
  }
}

/* SHOW UI */
function showWeather(d) {
  weatherBox.style.display = "block";
  errorEl.innerText = "";

  cityEl.innerText = d.name;
  tempEl.innerText = Math.round(d.main.temp) + "°C";
  descEl.innerText = d.weather[0].description;

  iconEl.src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;

  detailsEl.innerText =
    `Humidity ${d.main.humidity}% | Wind ${d.wind.speed} m/s`;

  mapFX(d.weather[0].main);
}

/* MAP WEATHER */
function mapFX(main) {
  if (main === "Rain" || main === "Drizzle") {
    setFX("rain");

  } else if (main === "Snow") {
    setFX("snow");

  } else if (["Mist", "Fog", "Haze"].includes(main)) {
    setFX("fog");

  } else {
    setFX("clear");
  }
}

/* EVENTS */
searchBtn.onclick = () => {
  const city = cityInput.value.trim();
  if (city) fetchData(`q=${city}`);
};

locBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    fetchData(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
  });
};
