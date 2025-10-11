from waitress import serve
from app import app

if __name__ == '__main__':
    print("Starting Watch My Back server...")
    print("Open your browser and navigate to: http://localhost:8080")
    serve(app, host='127.0.0.1', port=8080)