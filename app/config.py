from pymongo import MongoClient
import certifi
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# MongoDB connection
client = MongoClient(MONGODB_URI, tls=True, tlsAllowInvalidCertificates=False)
db = client[DATABASE_NAME]

# Collections
jobs_collection = db["jobs"]
resumes_collection = db["resumes"]
analyses_collection = db["analyses"]

print("Connected to MongoDB Atlas successfully!")