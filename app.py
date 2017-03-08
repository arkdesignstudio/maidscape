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
	amount = 500
	
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
	
	return render_template('charge.html', amount=amount, title="Charge")

if __name__=='__main__':
	app.run(debug=True, host='0.0.0.0', port=3000)