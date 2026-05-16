import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import KMeans
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/student_expense")
client = MongoClient(MONGO_URI)
db = client.get_database()
transactions_collection = db["transactions"]

@app.get("/")
def read_root():
    return {"message": "AI Financial Service is Running"}

@app.get("/predict/expense/{user_id}")
def predict_expense(user_id: str):
    """
    Predict next month's total expense using Random Forest.
    """
    from bson import ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Fetch transactions for the user
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}))
    if len(data) < 10:
        # Fallback to global student data for new users
        data = list(transactions_collection.find({"type": "Debit"}).limit(500))
        if len(data) < 10: return {"error": "Not enough data globally"}

    df = pd.DataFrame(data)
    df['createdAt'] = pd.to_datetime(df['createdAt'])
    df['month'] = df['createdAt'].dt.month
    df['year'] = df['createdAt'].dt.year

    # Aggregate monthly expenses
    monthly_expenses = df.groupby(['year', 'month'])['amount'].sum().reset_index()
    
    if len(monthly_expenses) < 3:
        return {"error": "Need at least 3 months of data to predict"}

    # Prepare data for model: Features -> Month index (1, 2, 3...)
    monthly_expenses['time_idx'] = np.arange(len(monthly_expenses))
    X = monthly_expenses[['time_idx']]
    y = monthly_expenses['amount']

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)

    # Predict next month
    next_idx = pd.DataFrame({'time_idx': [len(monthly_expenses)]})
    prediction = model.predict(next_idx)[0]

    return {
        "predicted_next_month_expense": round(prediction, 2),
        "historical_avg": round(y.mean(), 2)
    }

@app.get("/analyze/outliers/{user_id}")
def analyze_outliers(user_id: str):
    """
    Detect unusual spending spikes using Isolation Forest.
    """
    from bson import ObjectId
    user_obj_id = ObjectId(user_id)
    
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}, {"_id": 1, "amount": 1, "createdAt": 1, "merchant": 1}))
    if len(data) < 20:
        data = list(transactions_collection.find({"type": "Debit"}, {"_id": 1, "amount": 1, "createdAt": 1, "merchant": 1}).limit(500))
        if len(data) < 20: return {"error": "Not enough data for outlier detection"}

    df = pd.DataFrame(data)
    X = df[['amount']]

    model = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = model.fit_predict(X)

    # Filter out outliers (anomaly == -1)
    outliers = df[df['anomaly'] == -1]
    
    results = []
    for _, row in outliers.iterrows():
        results.append({
            "transaction_id": str(row['_id']),
            "amount": row['amount'],
            "merchant": row['merchant'],
            "date": str(row['createdAt'])
        })

    return {"outliers_detected": len(results), "outliers": results}

@app.get("/analyze/patterns/{user_id}")
def analyze_patterns(user_id: str):
    """
    Find frequent spending combinations using Apriori algorithm.
    """
    from bson import ObjectId
    user_obj_id = ObjectId(user_id)
    
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}, {"createdAt": 1, "category": 1}))
    if len(data) < 50:
        data = list(transactions_collection.find({"type": "Debit"}, {"createdAt": 1, "category": 1}).limit(500))
        if len(data) < 50: return {"error": "Not enough data for pattern mining"}

    df = pd.DataFrame(data)
    df['createdAt'] = pd.to_datetime(df['createdAt']).dt.date
    
    # Group by date to get daily transaction baskets
    baskets = df.groupby('createdAt')['category'].apply(list).tolist()
    
    te = TransactionEncoder()
    te_ary = te.fit(baskets).transform(baskets)
    df_baskets = pd.DataFrame(te_ary, columns=te.columns_)

    # Apply Apriori
    frequent_itemsets = apriori(df_baskets, min_support=0.1, use_colnames=True)
    if frequent_itemsets.empty:
         return {"patterns": []}
         
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5, num_itemsets=len(frequent_itemsets))
    
    patterns = []
    for _, row in rules.iterrows():
        patterns.append(f"When spending on {list(row['antecedents'])}, likely to spend on {list(row['consequents'])} (Conf: {row['confidence']:.2f})")

    return {"patterns": patterns}

@app.get("/analyze/cluster/{user_id}")
def analyze_cluster(user_id: str):
    """
    Cluster expenses into spending profiles using KMeans.
    """
    from bson import ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}, {"category": 1, "amount": 1}))
    if len(data) < 20:
        data = list(transactions_collection.find({"type": "Debit"}, {"category": 1, "amount": 1}).limit(500))
        if len(data) < 20: return {"error": "Not enough data for clustering"}

    df = pd.DataFrame(data)
    
    # Group by category
    category_spend = df.groupby('category')['amount'].sum().reset_index()
    
    if len(category_spend) < 3:
        return {"error": "Not enough categories for clustering"}
        
    X = category_spend[['amount']]
    
    # Simple K-Means clustering (using up to 3 clusters depending on data)
    n_clusters = min(3, len(category_spend))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    category_spend['cluster'] = kmeans.fit_predict(X)
    
    clusters = []
    for c in range(n_clusters):
        cluster_data = category_spend[category_spend['cluster'] == c]
        clusters.append({
            "cluster_id": c,
            "categories": cluster_data['category'].tolist(),
            "average_spend": float(cluster_data['amount'].mean())
        })
        
    return {"clusters": clusters}

@app.get("/analyze/weak_points/{user_id}")
def analyze_weak_points(user_id: str):
    """
    Analyze spending trend and identify weak points (overspending categories).
    """
    from bson import ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}))
    is_personal = True
    if len(data) < 5:
        data = list(transactions_collection.find({"type": "Debit"}).limit(500))
        is_personal = False
        if len(data) < 5: return {"error": "Not enough data"}

    df = pd.DataFrame(data)
    
    # Calculate category totals
    cat_totals = df.groupby('category')['amount'].sum()
    total_spend = cat_totals.sum()
    
    # Identify weak point (category with highest spend percentage)
    if total_spend == 0:
        return {"weak_point": "None", "suggestion": "Add more transactions to get insights."}
        
    weak_category = cat_totals.idxmax()
    weak_amount = cat_totals.max()
    percentage = (weak_amount / total_spend) * 100
    
    suggestion = f"You are spending heavily on {weak_category} ({percentage:.1f}% of total). Consider setting a strict weekly limit for {weak_category}."
    if not is_personal:
         suggestion = f"Based on generic student data, {weak_category} is a common weak point ({percentage:.1f}%). Watch your spending there once you add more transactions!"

    return {
        "weak_category": weak_category,
        "amount": float(weak_amount),
        "percentage": float(percentage),
        "suggestion": suggestion,
        "is_personal_data": is_personal
    }

class ChatMessage(BaseModel):
    message: str

@app.post("/chat/{user_id}")
def ai_chat(user_id: str, payload: ChatMessage):
    """
    Simulated LLM Chatbot endpoint for Financial Assistant.
    """
    from bson import ObjectId
    import re
    
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    msg = payload.message.lower()
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}))
    if len(data) == 0:
        return {"reply": "You haven't logged any transactions yet. Start adding expenses so I can analyze them!"}
    
    df = pd.DataFrame(data)
    
    # Intent: Ask for total spent
    if re.search(r'(total|how much).*spent', msg):
        total = df['amount'].sum()
        return {"reply": f"You've spent a total of ₹{total:,.2f} so far. Let's keep an eye on your budget!"}
        
    # Intent: Ask for specific category
    match = re.search(r'(how much|what).*on (food|transport|entertainment|shopping|utilities|other)', msg)
    if match:
        cat = match.group(2).capitalize()
        cat_total = df[df['category'] == cat]['amount'].sum()
        return {"reply": f"You've spent ₹{cat_total:,.2f} on {cat}. Check your dashboard for the full breakdown."}
        
    # Intent: Ask for biggest expense
    if re.search(r'(biggest|highest|most expensive).*expense', msg):
        max_idx = df['amount'].idxmax()
        biggest = df.loc[max_idx]
        return {"reply": f"Your biggest expense was ₹{biggest['amount']} at {biggest['merchant']} on {biggest['createdAt'].strftime('%Y-%m-%d')}."}
        
    # Intent: Ask for savings advice
    if re.search(r'(save|saving|advice|help)', msg):
        cat_totals = df.groupby('category')['amount'].sum()
        weak_category = cat_totals.idxmax()
        return {"reply": f"To save money, I suggest cutting back on {weak_category}, as it's your highest spending category right now. Consider setting a strict weekly limit!"}
        
    # Default fallback
    return {"reply": "I'm your AI Financial Assistant! You can ask me things like 'How much did I spend on Food?' or 'What was my biggest expense?'"}

@app.get("/analyze/subscriptions/{user_id}")
def analyze_subscriptions(user_id: str):
    """
    Detect recurring transactions (subscriptions/bills) using frequency and amount matching.
    """
    from bson import ObjectId
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    data = list(transactions_collection.find({"user": user_obj_id, "type": "Debit"}, {"merchant": 1, "amount": 1, "createdAt": 1}))
    is_personal = True
    if len(data) < 10:
        data = list(transactions_collection.find({"type": "Debit"}, {"merchant": 1, "amount": 1, "createdAt": 1}).limit(500))
        is_personal = False
        if len(data) < 10: return {"error": "Not enough data"}

    df = pd.DataFrame(data)
    df['createdAt'] = pd.to_datetime(df['createdAt'])
    df['month'] = df['createdAt'].dt.month
    df['year'] = df['createdAt'].dt.year

    # Find merchants that appear in multiple months with similar amounts
    # Group by merchant and rounded amount
    df['rounded_amount'] = df['amount'].round(-1) # Round to nearest 10
    
    subscriptions = []
    
    grouped = df.groupby(['merchant', 'rounded_amount'])
    for name, group in grouped:
        # If the same merchant and amount appears in more than 2 distinct months
        unique_months = group['month'].nunique()
        if unique_months >= 2:
            merchant, amount = name
            subscriptions.append({
                "merchant": merchant,
                "amount": float(group['amount'].mean()),
                "frequency": "Monthly",
                "occurrences": int(len(group))
            })
            
    # Sort by amount descending
    subscriptions.sort(key=lambda x: x['amount'], reverse=True)
    
    # Take top 5
    return {
        "subscriptions": subscriptions[:5],
        "is_personal_data": is_personal,
        "total_monthly_recurring": sum(s['amount'] for s in subscriptions[:5])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
