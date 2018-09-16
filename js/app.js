var lat = 0;
var lng = 0;
var defaultLat = 51.5073509;
var defaultLng = -0.12775829999998223;
var map = null;
var autocomplete;

$(document).ready( function() {
  initialize();
  $('#search-form').submit( function(event){
    clearScreen();
    //use just the first word of the topic, only one topic is allowed
    getMeetups($('#group').val().split(' ')[0], $('#distance').val());
  });

  //remove category input watermark if present
  $('#group').focus( function() {
    if($(this).val() == 'Enter a category') {
      $(this).val('');
      $(this).css('color', '#0a0a0a');
    }
  });
  $(window).resize(function() {
    setCanvasSize();
  });
});

function initialize() {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
    (document.getElementById('location')),
    { types: ['geocode'] });

  // Bias the autocomplete object to the user's geographical location,
  // as supplied by the browser's 'navigator.geolocation' object.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = new google.maps.LatLng(
           position.coords.latitude, position.coords.longitude);
      var circle = new google.maps.Circle({
          center: geolocation,
          radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
  // When the user selects an address from the dropdown,
  // set the global latitude and longitude
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    lat = place.geometry.location.lat();
    lng = place.geometry.location.lng();
    console.log('setting lat: ' + lat + ' lon: ' + lng);
      console.log('lat: ' + lat + ' lon: ' + lng);		
    //show just the part of the location before the comma in the text box
    var shortLocation = $('#location').val().split(',')[0];
    $('#location').val(shortLocation);
  });
  //if lat and lng are not set by location, set to default (London) and show the results
  if(lat == 0 && lng == 0 ) {
    lat =  defaultLat;
    lng =  defaultLng;
  }
  getMeetups('dogs', 10);
}

function setCanvasSize() {
  var mapCanvas = $('#map-canvas');
  mapCanvas.css('display', 'inline-block');
  if ($(window).width() > 700) {
    mapCanvas.css('width', '65%');
  } else {
    mapCanvas.css('width', '100%');
  }
  mapCanvas.height($('#map-canvas').width() / 1.5);  
}

//empty the group list, map, and error msg from the last result, if any
function clearScreen() {
  $('#group-list').empty();
  $('#map-canvas').empty();
  $('#map-canvas').css('display', 'none');
  $('#error').empty();
}

function getMeetups (group, distance) {

  // the parameters we need to pass in our request to Meetups's API
  var request = {
    key: '24a3d6c32673b27346e265224741b1b',
    topic: group,
    radius: distance,
    lat: lat,
    lon: lng 
  };
  var result = $.ajax({
    url: "https://api.meetup.com/2/groups",
    data: request,
    dataType: "jsonp",
    type: "GET",
    })
  .done(function(result){
    console.log(result);
    //if there is a results array in the object, show results. Otherwise display the error
    if (typeof(result.results) != "undefined" && result.results.length != 0) {
      showMeetups(result.results);
    }
    else {
      $('#error').text('Your search did not return any results.');
    }
  })
  .fail(function(jqXHR, error, errorThrown){
    console.error(error.message);
    $('#error').text(errorElem);
  });
}

function showMeetups(groups) {
  //show the map
  setCanvasSize();

  //create new Google map with center as our location
  var mapOptions = {
    center: {
      lat: lat,
      lng: lng
    },
    zoom: 8
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  $('#map-canvas').css('border', '1px solid #a3a3a3');

  //this array will store the html to be appended to the results list
  var items = [];

  $.each(groups, function(i, item) {
    items.push('<li><a href="' + item.link + '" target="_blank">' + item.name + '</a></li>');
    //add markers to the google map
    var marker = new google.maps.Marker({
      position: { lat: item.lat, lng: item.lon},
      map: map,
      title: item.name,
      url: item.link
    });
    google.maps.event.addListener(marker, 'click', function() {
      window.open(marker.url, '_blank');
    });		
  });
  $('#group-list').append( items.join('') );

}