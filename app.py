from flask import Flask, render_template, request, jsonify
import cloudscraper
import requests
import time
from datetime import datetime
import json
import os

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
        
    def format_breach_data(self, breach, source):
        """Format breach data consistently"""
        formatted = {
            'Name': breach.get('Name', 'Unknown Source'),
            'BreachDate': breach.get('BreachDate', 'Unknown Date'),
            'DataClasses': breach.get('DataClasses', ['Unknown Data Types']),
            'Description': breach.get('Description', 'No description available'),
            'source': source
        }
        print(f"Formatted breach from {source}: {formatted}")
        return formatted

    def get_breach_stats(self, breaches):
        """Calculate breach statistics"""
        hibp_count = len([b for b in breaches if b.get('source') == 'HIBP'])
        return {
            'total': len(breaches),
            'hibp_count': hibp_count
        }

    def check_hibp(self, email):
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
                return []
            
            if response.status_code != 200:
                return []
            
            data = response.json()
            breaches = data.get('Breaches', [])
            
            # Format and mark each breach as coming from HIBP
            formatted_breaches = []
            for breach in breaches:
                formatted_breach = self.format_breach_data(breach, 'HIBP')
                formatted_breaches.append(formatted_breach)
                
            return formatted_breaches
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error occurred: {str(e)}'
            }

    def check_email(self, email):
        try:
            # Get breaches from HIBP
            hibp_breaches = self.check_hibp(email)
            
            return {
                'status': 'success',
                'email': email,
                'breaches': hibp_breaches
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
    
    if result['status'] == 'success' and result['breaches']:
        stats = checker.get_breach_stats(result['breaches'])
        result['stats'] = stats
        
    return render_template('index.html', result=result)

if __name__ == '__main__':
    print("WARNING: This is a development server. Use server.py for production.")
    app.run(debug=False, port=5000)