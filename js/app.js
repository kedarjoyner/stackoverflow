// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000 * question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showAnswerers = function(answerer) {

	// clone our result template code
	var result = $('.templates .top-answerers').clone();

	// Set the question properties in result

	var answererElem = result.find('.profile-link a');
	answererElem.attr( 'href', answerer.user.link );
	answererElem.text( answerer.user.link );

	// Set the answerer's score property in result

	var answererScoreElem = result.find('.user-score');
	answererScoreElem.text( answerer.score );

	// Set the answerer's Display Name property in result

	var answererNameElem = result.find('.display-name');
	answererNameElem.attr(answerer.user.display_name);
	answererNameElem.text( answerer.user.display_name);

	console.log(answerer.user.display_name);

	// var numberOfPosts = result.find('.number-of-posts');
	// numberOfPosts.attr(answerer.post_count);
	// numberOfPosts.text(answerer.post_count);
	$('.number-of-posts').text(answerer.post_count); // max's solution - it works!
	console.log(answerer.post_count);

	// console.log(numberOfPosts.text(answerer.post_count));

	
	return result;

};

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
	console.log(query);
	console.log('jQuery');
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};

	// this is a function that does the api call. talking to the server. ajax makes it happen
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		// http://api.stackexchange.com/2.2/questions/unanswered?tagged=ruby&site=stackoverflow&order=desc&sort=creation
		data: request, // request above becomes request here. technically grabbing the perameters
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET"
	})
	.done(function(result){ //this waits for the ajax to return the result. result object is created
		//console.log(result);
		//console.log(result.item[0]);
		//console.log(result.items[0].owner.display_name);
		var searchResults = showSearchResults(request.tagged, result.items.length); // showing 30

		$('.search-results').html(searchResults); // make html what searchResults returns
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) { // looping through items
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


// takes string of one tag to be searched at a time
var getTopAnswerers = function(tag) { // pass subject matter
	// the parameteres we need to pass in our request to StackOverflow's API
	var request = {
		period: 'month',
		//tag: tag // property names, doesn't affect what's left of colon - we added this below " + "
	};

	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/all_time?site=stackoverflow",
		data: request, // request above becomes request here. technically grabbing the perameters
		dataType: "jsonp",//use jsonp to avoid cross origin issues - what the hell does this mean?
		type: "GET"
	})

	.done(function(result){ //this waits for the ajax to return the result. result object is created
		var searchResults = showSearchResults(tag, result.items.length ); // showing 30

		$('.search-results').html(searchResults); // make html what searchResults returns
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) { // looping through items
			var answerer = showAnswerers(item);
			$('.results').append(answerer);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});

};



$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});
	$('.inspiration-getter').submit( function(e) {
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tag = $(this).find("input[name = 'answerers']").val();
		getTopAnswerers(tag);
	});
});



