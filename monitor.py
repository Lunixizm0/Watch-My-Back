import cloudscraper
from bs4 import BeautifulSoup
from datetime import datetime
import json
import time

class BreachMonitor:
    def __init__(self):
        self.email = input("Enter the email address to check: ").strip()
        self.scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'mobile': False
            }
        )

    def check_hibp(self):
        """Check Have I Been Pwned for breaches"""
        if not self.email:
            print("Please enter a valid email address")
            return

        try:
            print(f"[{datetime.now()}] Checking {self.email} for breaches...")
            
            # Make the request with required headers
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
            
            # Add a small delay
            time.sleep(2)
            
            # Now check the email
            url = f"https://haveibeenpwned.com/unifiedsearch/{self.email}"
            response = self.scraper.get(url, headers=headers)
            
            # 404 means no breaches found
            if response.status_code == 404:
                print(f"[{datetime.now()}] Good news! No breaches found for {self.email}")
                return
                
            if response.status_code != 200:
                print(f"[{datetime.now()}] Error checking breaches: {response.status_code}")
                if response.status_code == 403:
                    print("The website is blocking automated requests. Try again in a few minutes.")
                return
                
            # Parse the JSON response
            try:
                data = response.json()
                breaches = data.get('Breaches', [])
                
                if breaches:
                    print(f"\n[{datetime.now()}] ⚠️ BREACHES FOUND! ⚠️")
                    print(f"Found {len(breaches)} breaches for {self.email}")
                    print("\nBreach Details:")
                    
                    for breach in breaches:
                        print(f"\nSite: {breach.get('Name')}")
                        print(f"Breach Date: {breach.get('BreachDate')}")
                        
                        # Get and display compromised data types
                        data_classes = breach.get('DataClasses', [])
                        if data_classes:
                            print("Compromised Data:")
                            for data_type in data_classes:
                                print(f"  • {data_type}")
                        
                        if breach.get('Description'):
                            print(f"Description: {breach.get('Description')}")
                        print("---")
                else:
                    print(f"[{datetime.now()}] No breach data found in the response")
                    
            except json.JSONDecodeError:
                print(f"[{datetime.now()}] Error parsing the response from the server")
                
        except Exception as e:
            print(f"[{datetime.now()}] Error occurred: {str(e)}")

if __name__ == "__main__":
    monitor = BreachMonitor()
    monitor.check_hibp()