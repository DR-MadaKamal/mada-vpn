import sys, os
print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")
print(f"Dir: {os.listdir('.')}")
print("Importing app...")
sys.stdout.flush()
try:
    from app.main import app
    print("Import OK")
except Exception as e:
    import traceback
    print(f"Import failed: {e}")
    traceback.print_exc()
