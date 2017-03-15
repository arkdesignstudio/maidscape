import os
from flask import Flask, render_template, request
import stripe

stripe_keys = {
	'secret_key': os.environ['SECRET_KEY'],
	'publishable_key' : os.environ['PUBLISHABLE_KEY']
}

stripe.api_key = stripe_keys['secret_key']

app = Flask(__name__)

@app.route('/')
@app.route('/index.html')
def index():
  return render_template('index.html', title="Home")

@app.route('/form')
def form():
  return render_template('form.html', title="Book")

@app.route('/about')
def about():
  return render_template('about.html', title="About")

@app.route('/pricing')
def pricing():
  return render_template('pricing.html', title="Services & Pricing")

@app.route('/charge', methods=['POST'])
def charge():

	# Amount in cents
	amount = request.form['price']

	# check if amount matches
	bedrooms = int(request.form['bedrooms'])
	bathrooms = int(request.form['bathrooms'])
	extra_services = map(int, request.form.getlist('extra'))
	check = check_price(bedrooms, bathrooms, extra_services)
	amount = amount if check == amount else check


	customer = stripe.Customer.create(
		email='customer@example.com',
		source=request.form['stripeToken']
	)

	charge = stripe.Charge.create(
		customer=customer.id,
		amount=amount,
		currency='usd',
		description='Test Charge'
	)

	amount = str(amount/100) + '.00'

	return render_template('charge.html', amount=amount, title="Charge")


def check_price(bedrooms, bathrooms, extra_services):
	if bedrooms == 0 or bathrooms == 0:
		# error
		return 0;

	prices = 	[[14500, 16500, 18500, 20500, 22500],
				 [16500, 18500, 20500, 22500, 24500],
			 	 [19000, 21000, 23000, 25000, 27000],
				 [22000, 24000, 26000, 28000, 30000],
				 [25500, 27500, 29500, 31500, 33500]]
	return prices[bedrooms - 1][bathrooms - 1] + sum(extra_services) * 100

if __name__=='__main__':
	app.run(debug=True, host='0.0.0.0', port=3000)
