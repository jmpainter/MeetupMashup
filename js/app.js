var city = '';
var state = '';
var zip = '';
var country = '';
var lat = '';
var lng = '';
var map = null;

$(document).ready( function() {
	initialize();
	$('#search-form').submit( function(event){
		console.log('search-form submit');
		$(this).find("input[name='tags']").val();
		getMeetups($('#group').val(), $('#distance').val());
	});
});

function getMeetups (group, distance) {
	console.log('getMeetups(' + group + ', ' + distance);

	// the parameters we need to pass in our request to StackOverflow's API
	var request = {key: '24a3d6c32673b27346e265224741b1b',
								topic: group,
								lat: lat,
								lon: lng};
	console.log(request);
	var result = $.ajax({
		url: "https://api.meetup.com/2/groups",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		showMeetups(result.results);
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}


function showMeetups(groups) {

	//create new Google map with center as our location
	var mapOptions = {
		center: { lat: lat, lng: lng},
		zoom: 8
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	$('#map-canvas').css('border', '1px solid #a3a3a3');

	//this array will store the html to be appended to the results list
 	var items = [];

	$.each(groups, function(i, item) {
		items.push('<li><a href="' + item.link + '">' + item.name + '</a></li>');
		console.log('name: ' + item.name + ' lat: ' + item.lat + ' lon: ' + item.lon);
		var marker = new google.maps.Marker({
			position: { lat: item.lat, lng: item.lon},
			map: map,
			title: item.name,
			url: item.link
		});
		google.maps.event.addListener(marker, 'click', function() {
			window.location.href = marker.url;
		});		
	});
	$('#group-list').append( items.join('') );

}

//Autocompletion of place input

var autocomplete;

function initialize() {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
		/** @type {HTMLInputElement} */(document.getElementById('location')),
		{ types: ['geocode'] });
  // When the user selects an address from the dropdown,
  // populate the address fields in the form.
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
		var place = autocomplete.getPlace();
		lat = place.geometry.location.lat();
  		lng = place.geometry.location.lng();
  		console.log('latitude: ' + lat + ' longitude: ' + lng);
  });
}

// [START region_geolocation]
// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
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
}
