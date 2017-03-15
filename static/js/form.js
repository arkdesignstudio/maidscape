$(document).ready(function() {
	$('select').material_select();
	injectTotal(calculateTotalPrice(0, 0, [0]));
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

	// Temporarily see what we have saved in the form data
	var bedrooms = document.getElementById('beds').value;
	var bathrooms = document.getElementById('baths').value;
	var extraServices = $("#extra").val();

	var date = $('#date').val();
	var time = $('#time').val();

	if (!bedrooms || !bathrooms || !date || !time) {
		// Inform user there was an error in calculating the total price
		alert("Please make sure you fill in all required selections.");
	} else {

		stripe.createToken(card).then(function(result) {
	    if (result.error) {
	      // Inform the user if there was an error
	      var errorElement = document.getElementById('card-errors');
	      errorElement.textContent = result.error.message;
	    } else {
	      // Send the token to your server
	      stripeTokenHandler(result.token, calculateTotalPrice(bedrooms, bathrooms, extraServices));
	    }
	  });
	}
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
	form.appendChild(createHiddenInput('bedrooms', $('#beds').val()));
	form.appendChild(createHiddenInput('bathrooms', $('#baths').val()));
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
function injectTotal(total)  {
	total = total/100 + '.00'
	document.getElementById('total').innerHTML = '<h3 class="right header teal-text light">Total:&nbsp; &nbsp; $' + total + '</h3>'
}

$('#beds').on('change', function() {
	injectTotal(calculateTotalPrice($(this).val(), $('#baths').val(), $('#extra').val()));
})

$('#baths').on('change', function() {
	injectTotal(calculateTotalPrice($('#beds').val(), $(this).val(), $('#extra').val()));
})

$('#extra').on('change', function() {
	injectTotal(calculateTotalPrice($('#beds').val(), $('#baths').val(), $(this).val()));
})

// in cents
function calculateTotalPrice(bedrooms, bathrooms, extraServices) {

	// prices
	var prices = new Array(6);
	for (var i = 1; i < 6; i++) {
		prices[i] = new Array(6);
	}
	prices[1][1] = 145;
	prices[2][1] = 165;
	prices[3][1] = 190;
	prices[4][1] = 220;
	prices[5][1] = 255;
	for (var i = 1; i < 6; i++) {
		for (var j = 2; j < 6; j++) {
			prices[i][j] = prices[i][j - 1] + 20;
		}
	}


	if (!bedrooms || !bathrooms) {
		return 0;
	} else {
		var extras = extraServices.map(function(x) {
			return parseInt(x, 10);
		})
		var sum = extras.reduce(function(a, b) { return a + b; }, 0);
		return (prices[bedrooms][bathrooms] + sum) * 100;
	}
}
