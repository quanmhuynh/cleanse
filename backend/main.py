from server import app
import uvicorn
def main():
    print("Hello from backend!")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
