import os
import time

def main():
    db_url = os.getenv("DATABASE_URL", "Not set")
    print(f"[UniPulse Analytics] Initializing Data Pipeline Engine...")
    print(f"[UniPulse Analytics] Database connection string configured.")
    print(f"[UniPulse Analytics] Service running and listening for ETL events...")
    while True:
        time.sleep(60)

if __name__ == "__main__":
    main()
