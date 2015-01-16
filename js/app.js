$(document).ready( function() {
	initialize();
	$('#search-form').submit( function(event){
		console.log('search-form submit');
		$(this).find("input[name='tags']").val();
		getMeetups($('#group').val(), $('#distance').val(), $('#location').val());
	});
});

function getMeetups (group, distance, location) {
	console.log('getMeetups(' + group + ', ' + distance + ', ' + location + ')');

	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
}

//Autocompletion of place input

var autocomplete;

var componentForm = {
	locality: 'long_name',
	country: 'long_name',
	postal_code: 'short_name',
	administrative_area_level_1: 'some_name'
};
var city = '';
var state = '';
var zip = '';

function initialize() {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
		/** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
		{ types: ['geocode'] });
  // When the user selects an address from the dropdown,
  // populate the address fields in the form.
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
		fillInAddress();
  });
}

// [START region_fillform]
function fillInAddress() {
	 // Get the place details from the autocomplete object.
	var place = autocomplete.getPlace();
	// Get each component of the address from the place details
	// and fill the corresponding field on the form.
	for (var i = 0; i < place.address_components.length; i++) {

		var t = place.address_components[i].types;
		if(compIsType(t, 'administrative_area_level_1'))
			state = place.address_components[i].long_name; //store the state
		else if(compIsType(t, 'locality'))
			city = place.address_components[i].long_name; //store the city
		else if(compIsType(t, 'postal_code'))
			zip = place.address_components[i].long_name;
	}
	console.log(city + ' ' + state + ' ' + zip);

}

function compIsType(t, s) { 
	for(z = 0; z < t.length; ++z) {
		if(t[z] == s) {
			return true;
		}
	}
	return false;
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
// [END region_geolocation]
