from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import datetime
import os
import getpass  #  For getting the current user's name

FOLDER = "C:/CyberSecure_Workspace"
LOGFILE = "folder_log.csv"  #  Use .csv for structured format

#  Header for the CSV (if file is new)
if not os.path.exists(LOGFILE):
    with open(LOGFILE, "w") as f:
        f.write("timestamp,username,action,filename\n")

class FolderActivityLogger(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            self.log_event("Modified", event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            self.log_event("Created", event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            self.log_event("Deleted", event.src_path)

    def log_event(self, action, path):
        timestamp = datetime.datetime.now().isoformat()
        username = getpass.getuser()  #  Logged-in OS user
        filename = os.path.basename(path)  #  Only the file name

       # ✨ Ignore specific files (like instructions.txt)
        ignored_files = ['instructions.txt']
        if any(ignored in path for ignored in ignored_files):
            return  # Don't log this one
        
        with open(LOGFILE, "a") as f:
            f.write(f"{timestamp},{username},{action},{filename}\n")

if __name__ == "_main_":
    if not os.path.exists(FOLDER):
        print("❌ Folder not found. Make sure the secure folder is created first.")
        exit()

    observer = Observer()
    event_handler = FolderActivityLogger()
    observer.schedule(event_handler, FOLDER, recursive=True)
    observer.start()
    print(f"✅ Monitoring started on {FOLDER}...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()