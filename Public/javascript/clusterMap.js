
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
    container: 'cluster-map', //id name for the map in which we can reference to id=cluster-map
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [-103.5917, 40.6699],
    zoom: 3
});

map.on('load', () => {
    //console.log('MAP LOADS')
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [ //changes color based on amount of points in a cluster
                'step',
                ['get', 'point_count'],
                '#51bbd6', //10 or below cluster circle color is '#51bbd6'
                10,  //amount of points in a cluster to change to the following color
                '#f1f075', //10 or above and below 30 cluster circle color is '#f1f075'
                30, //amount of points in a cluster to change to the following color
                '#f28cb1' //30 or above cluster circle color is '#f28cb1'
            ],
            'circle-radius': [ //changes circle radius based on amount of points in a cluster
                'step', 
                ['get', 'point_count'],
                15, //pixel width/radius
                10, //amount of points in a cluster to change to the following radius/width
                23, //pixel width/radius
                30, //amount of points in a cluster to change to the following radius/width
                30 //pixel width/radius
            ]
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({ //base element in map, points to a specific location.
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': 'red',
            'circle-radius': 5,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom( //zoom into a cluster and see more details, it also centers that clicked cluster point as the new center of the map
            clusterId,
            (err, zoom) => { //zoom is the zoom level
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom 
                });
            }
        );
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', (e) => {
        const propertiesMarkup = e.features[0].properties.popUpMarkup
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(propertiesMarkup)
            .addTo(map);
    });

    map.on('mouseenter', 'clusters', () => {
        //console.log('MOUSING OVER A CLUSTER!!!!')
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = '';
    });
});
map.addControl(new mapboxgl.NavigationControl())