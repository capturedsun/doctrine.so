// Preview a wordmark face: ?wm=Pirata+One (Google Fonts family name).
// Germanika falls back to UnifrakturMaguntia until /_/fonts/Germanika.ttf exists.
const params=new URLSearchParams(location.search);
const q=params.get("wm");
const wm=q&&q.split(":")[0];
if(wm){
  const load=wm==="Germanika"?"UnifrakturMaguntia":q;
  if(wm!=="Laandbrau")document.head.insertAdjacentHTML("beforeend",`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(load).replace("%3A",":").replace("%40","@")}&display=block">`);
  document.documentElement.style.setProperty("--wordmark",wm==="Germanika"?'"Germanika", "UnifrakturMaguntia"':`"${wm}"`);
}
// Preview subtitle systems: ?subtitle=IBM+Plex+Mono:wght@400
const subtitleQuery=params.get("subtitle");
const subtitle=subtitleQuery&&subtitleQuery.split(":")[0];
if(subtitle){
  if(subtitle!=="Oswald")document.head.insertAdjacentHTML("beforeend",`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(subtitleQuery).replace("%3A",":").replace("%40","@")}&display=block">`);
  document.documentElement.style.setProperty("--subtitle",`"${subtitle}"`);
}
