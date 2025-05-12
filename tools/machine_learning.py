import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# === Load JSON Data ===
with open('ids.json', 'r') as file:
    matches = json.load(file)

# === Convert to DataFrame and Engineer Features ===
df = pd.DataFrame(matches)
df['date'] = pd.to_datetime(df['date'])
df['hour'] = df['date'].dt.hour
df['weekday'] = df['date'].dt.weekday
df['id_num'] = df['id'].apply(lambda x: int(x.split(":")[-1]))
df = df.sort_values(by='date').reset_index(drop=True)

# === Define Features and Labels ===
feature_cols = ['shortCode', 'hour', 'weekday', 'id_num']
X_train = []
y_home = []
y_away = []

# === Initialize Models ===
home_model = RandomForestRegressor(n_estimators=100, random_state=42)
away_model = RandomForestRegressor(n_estimators=100, random_state=42)

# === Tracking ===
streak = 0
results = []

for i, row in df.iterrows():
    features = [row[col] for col in feature_cols]
    
    # Predict only if trained
    if len(X_train) > 5:
        pred_home = round(home_model.predict([features])[0])
        pred_away = round(away_model.predict([features])[0])
    else:
        pred_home, pred_away = -1, -1  # Dummy wrong guess

    correct = (pred_home == row['homeScore']) and (pred_away == row['awayScore'])

    results.append({
        'match_id': row['id'],
        'predicted_home': pred_home,
        'predicted_away': pred_away,
        'actual_home': row['homeScore'],
        'actual_away': row['awayScore'],
        'correct': correct,
        'streak': streak
    })

    if correct:
        streak += 1
    else:
        streak = 0
        X_train.append(features)
        y_home.append(row['homeScore'])
        y_away.append(row['awayScore'])

        # Retrain model
        home_model.fit(X_train, y_home)
        away_model.fit(X_train, y_away)

    if streak >= 50:
        print(f"\n✅ Streak of 50 achieved at match {i}!")
        break

# === Final Report ===
print("\n📊 Last 10 Predictions:")
for r in results[-10:]:
    print(r)

if len(X_train) > 0:
    home_importances = home_model.feature_importances_
    away_importances = away_model.feature_importances_
    print("\n📈 Feature Importance (Home Score):")
    for name, imp in zip(feature_cols, home_importances):
        print(f"  {name}: {imp:.4f}")

    print("\n📈 Feature Importance (Away Score):")
    for name, imp in zip(feature_cols, away_importances):
        print(f"  {name}: {imp:.4f}")

print(f"\n🔥 Final Streak: {streak}")
