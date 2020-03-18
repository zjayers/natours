/* eslint-disable */



export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiempheWVycyIsImEiOiJjazd4cjJsa3YwMDR1M2ZsZW9xZ3R5cHdrIn0.9Hi3ZkkJJshJPI-8zbQxzA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zjayers/ck7xr5kow026f1im3cigg3kv4',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create a marker
    const htmlEl = document.createElement('div');
    htmlEl.className = 'marker';

    // Add Marker To Map
    new mapboxgl.Marker({
      element: htmlEl,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add a tooltip to the marker

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend the Map bounds to include the current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: { top: 200, bottom: 150, left: 100, right: 100 }
  });
};
