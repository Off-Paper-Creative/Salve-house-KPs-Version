
var mapStyles = { "1": [{ "stylers": [{ "hue": "#ff1a00" }, { "invert_lightness": true }, { "saturation": -100 }, { "lightness": 33 }, { "gamma": 0.5 }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#2D333C" }] }], "2": [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#1e1e20" }, { "visibility": "on" }] }], "3": [{ "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#000000" }, { "lightness": 40 }] }, { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#000000" }, { "lightness": 16 }] }, { "featureType": "all", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }, { "lightness": 20 }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 17 }, { "weight": 1.2 }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 20 }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 21 }] }, { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }, { "lightness": 17 }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 29 }, { "weight": 0.2 }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 18 }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 16 }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 19 }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 17 }] }], "4": [{ "featureType": "landscape", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "stylers": [{ "hue": "#00aaff" }, { "saturation": -100 }, { "gamma": 2.15 }, { "lightness": 12 }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "visibility": "on" }, { "lightness": 24 }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 57 }] }] };

function initializeMap_v2(id, { locations, mapStyle, zoom, markerIcon }) {

    var map = new google.maps.Map(document.getElementById(id), {
        zoom: zoom,
        center: new google.maps.LatLng(locations[0].lat, locations[0].lng),
        mapTypeControl: false,
        mapTypeControlOptions: {
            mapTypeIds: ['Styled']
        },
        navigationControl: true,
        navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL },
        mapTypeId: 'Styled',
    });
    var styledMapType = new google.maps.StyledMapType(mapStyles[mapStyle], { name: 'Styled' });
    map.mapTypes.set('Styled', styledMapType);

    var infowindow = new google.maps.InfoWindow();


    var mapMarker = {
        path: "M31.5 17C31.5 20.9416 30.2475 24.9778 28.3148 29.126C26.3817 33.2751 23.7875 37.4973 21.1319 41.8182L21.1283 41.824C19.3859 44.6592 17.6184 47.535 16.0089 50.4429C14.2381 47.114 12.2752 43.8592 10.363 40.6886L10.3589 40.6818C7.79642 36.4328 5.32919 32.3407 3.5 28.3804C1.6708 24.4201 0.5 20.633 0.5 17C0.5 7.84656 6.92635 0.5 16 0.5C25.0736 0.5 31.5 7.84656 31.5 17ZM16 30.5C18.7301 30.5 21.1128 28.5864 22.7829 26.0229C24.4622 23.4453 25.5 20.1011 25.5 17C25.5 11.7533 21.2467 7.5 16 7.5C10.7533 7.5 6.5 11.7533 6.5 17C6.5 20.1011 7.53785 23.4453 9.2171 26.0229C10.8872 28.5864 13.2699 30.5 16 30.5Z",
        fillColor: "white",
        fillRule:"evenodd",
        clipRule:"evenodd",
        strokeColor: "black",
        anchor: new google.maps.Point(
            32, // width
            52 // height
        ),
    };

    var marker, i;

    for (i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
            map: map,
            icon: mapMarker,
            title: locations[i].location,
            zIndex: 3
        });

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent("<h6>" + locations[i].location + "</h6>" + locations[i].address);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

function map(){

    var mapSelectors = document.querySelectorAll('.section-map-addresses-list-item');

    for( let map of mapSelectors){
        var coordinates = map.dataset.latlng.split(",")
        var mapId = map.dataset.targetId
        var location = map.querySelector('.section-map-addresses-list-item__location').innerText;
        var address = map.querySelector('.section-map-addresses-list-item__address').innerText;

        initializeMap_v2(mapId, { 
            locations: [
                {
                    location: location,
                    address: address,
                    lat: coordinates[0],
                    lng: coordinates[1]
                }
            ], 
            mapStyle: 4, 
            zoom: 15 
        });
    }

}

map();

class LocationMap extends HTMLElement{
    constructor(){
        super();

        var mapDetails = this.querySelectorAll('.section-map-addresses-list-item');
        var maps = this.querySelectorAll('.section-map-maps-map');

        if( mapDetails.length > 0 ){
            mapDetails[0].classList.add('active');
        }
        if( maps.length > 0 ){
            maps[0].classList.add('active');
        }

        mapDetails.forEach((mapData, i)=> {
            mapData.addEventListener('click', (event) => {
                mapDetails.forEach((mapDetail) => { mapDetail.classList.remove('active') })
                maps.forEach((map) => { map.classList.remove('active') })

                mapData.classList.contains('active') ? mapData.classList.remove('active') : mapData.classList.add('active')
                maps[i].classList.contains('active') ? maps[i].classList.remove('active') : maps[i].classList.add('active')
            })


            // console.log("title visible", mapData.matches(':focus-visible'));
            if( mapData.matches(':focus-visible') ){
                console.log("visible");
                // this.onClick();
            }
            // this.querySelector('.collapsible-row__title').matches(':focus-visible').addEventListener('click', (event) => {
            //     this.onClick(event);
            // })

            // mapData.matches(':focus-visible')
        })

    }


}

customElements.define('location-map', LocationMap);