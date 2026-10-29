import base64, sys, os
target = sys.argv[1]
b64_str = sys.argv[2]
os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
with open(target, 'wb') as f:
    f.write(base64.b64decode(b64_str))
print('Written', target)
