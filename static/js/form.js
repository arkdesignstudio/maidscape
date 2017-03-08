$(document).ready(function() {
	$('select').material_select();
});

$('.datepicker').pickadate({
	selectMonths: true, // Creates a dropdown to control month
	selectYears: 15 // Creates a dropdown of 15 years to control year
});

var stripe = Stripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
var style = {
  base: {
    // Add your base input styles here. For example:
    fontSize: '16px',
    lineHeight: '24px'
  }
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

// Add an instance of the card Element into the `card-element` <div>
card.mount('#card-element');

card.addEventListener('change', function(event) {
  var displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Create a token or display an error the form is submitted.
var form = document.getElementById('payment-form');
form.addEventListener('submit', function(event) {
  event.preventDefault();

  stripe.createToken(card).then(function(result) {
    if (result.error) {
      // Inform the user if there was an error
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      // Send the token to your server
      stripeTokenHandler(result.token, calculateTotalPrice());
    }
  });
});

function stripeTokenHandler(token, price) {
  // Insert the token ID into the form so it gets submitted to the server
  var form = document.getElementById('payment-form');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  form.appendChild(hiddenInput);

	// Get elements TODO
	form.appendChild(createHiddenInput('bedrooms', 3));
	form.appendChild(createHiddenInput('bathrooms', 2));
	form.appendChild(createHiddenInput('price', price));


  // Submit the form
  form.submit();
}

function createHiddenInput(name, value) {
	var hiddenInput = document.createElement('input');
	hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', name);
  hiddenInput.setAttribute('value', value);
	return hiddenInput;
}

// Inject payment total into div
var total = calculateTotalPrice()/100 + '.00';
document.getElementById('total').innerHTML = '<h3 class="header teal-text light">Total:&nbsp; &nbsp; $' + total + '</h1>'

// in cents
function calculateTotalPrice() {
	// get form data
	var form = document.getElementById('payment-form');

	// prices
	var prices = new Array(5);
	for (var i = 0; i < 5; i++) {
		prices[i] = new Array(5);
	}
	prices[0][0] = 145;
	prices[1][0] = 165;
	prices[2][0] = 190;
	prices[3][0] = 220;
	prices[4][0] = 255;
	for (var i = 0; i < 5; i++) {
		for (var j = 1; j < 5; j++) {
			prices[i][j] = prices[i][j - 1] + 20;
		}
	}

	// TODO
	// Get number of bedrooms
	var bedrooms = 3;

	// Get number of bathrooms
	var bathrooms = 2;

	// Get extra services

	// Calculate
	return prices[bedrooms][bathrooms]*100;

}
