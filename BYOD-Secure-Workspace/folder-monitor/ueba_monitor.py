import pandas as pd
import datetime
import time

LOGFILE = "folder_log.csv"
ALERT_LOG = "ueba_alerts.csv"

# Create alert file if it doesn't exist
try:
    with open(ALERT_LOG, 'x', encoding='utf-8') as f:
        f.write("timestamp,username,issue\n")
except FileExistsError:
    pass

def detect_anomalies():
    df = pd.read_csv(LOGFILE)

    #  Handle timestamps with UTC "Z" format
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True, errors='coerce').dt.tz_convert('Asia/Kolkata')


    # Filter invalid timestamps
    df = df[df['timestamp'].notnull()]

    #  Floor to minute for grouping
    df['minute'] = df['timestamp'].dt.floor('min')

    #  Detect 10+ downloads in 1 min
    downloads = df[df['action'] == 'Downloaded']
    grouped = downloads.groupby(['username', 'minute'])
    for (username, minute), group in grouped:
        if len(group) >= 10:
            log_alert(username, f"⬇ {len(group)} downloads in 1 minute", minute)

    #  Off-hour access detection (local hours 8–20)
    for _, row in df.iterrows():
      hour = row['timestamp'].hour
      if hour < 8 or hour > 20:
        log_alert(row['username'], f"🌙 Access at off-hour: {hour}h", row['timestamp'])


def log_alert(username, issue, timestamp):
    if os.path.exists(ALERT_LOG):
        with open(ALERT_LOG, 'r', encoding='utf-8') as f:
            if f"{timestamp},{username},{issue}" in f.read():
                return  # alert already logged
    with open(ALERT_LOG, 'a', encoding='utf-8') as f:
        f.write(f"{timestamp},{username},{issue}\n")
    print(f"🚨 Alert: {username} - {issue}")



if __name__ == "_main_":
    print("🔁 UEBA engine started...")

    while True:
        detect_anomalies()
        time.sleep(60)  # wait 60 seconds before checking again