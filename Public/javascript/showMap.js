
mapboxgl.accessToken = mapboxToken
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/satellite-streets-v12', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 9, // starting zoom
});

/* So we make a marker, set the latitude and longitude where it should go, then we set popup on that marker, which is what should happen when a user clicks, here's the popup. */
new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(
        `<h3>${campground.title}</h3>`
    )
)
.addTo(map)

map.addControl(new mapboxgl.NavigationControl())
