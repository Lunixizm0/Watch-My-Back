from flask import Flask, render_template, request, jsonify
import cloudscraper
from datetime import datetime
import json

app = Flask(__name__)

class BreachChecker:
    def __init__(self):
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'mobile': False
            }
        )

    def check_email(self, email):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://haveibeenpwned.com/',
                'DNT': '1',
                'Connection': 'keep-alive',
            }
            
            # First get the main page to handle any cloudflare checks
            self.scraper.get("https://haveibeenpwned.com/", headers=headers)
            
            # Now check the email
            url = f"https://haveibeenpwned.com/unifiedsearch/{email}"
            response = self.scraper.get(url, headers=headers)
            
            if response.status_code == 404:
                return {
                    'status': 'success',
                    'email': email,
                    'breaches': []
                }
            
            if response.status_code != 200:
                return {
                    'status': 'error',
                    'message': f'Error checking breaches: {response.status_code}'
                }
            
            data = response.json()
            breaches = data.get('Breaches', [])
            
            return {
                'status': 'success',
                'email': email,
                'breaches': breaches
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error occurred: {str(e)}'
            }

checker = BreachChecker()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/check', methods=['POST'])
def check_email():
    email = request.form.get('email')
    if not email:
        return render_template('index.html', result={
            'status': 'error',
            'message': 'Please provide an email address'
        })
    
    result = checker.check_email(email)
    return render_template('index.html', result=result)

if __name__ == '__main__':
    print("WARNING: This is a development server. Use server.py for production.")
    app.run(debug=False, port=5000)