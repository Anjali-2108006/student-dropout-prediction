import sys, os
target = sys.argv[1]
content = sys.stdin.read()
os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Successfully saved: {target} ({len(content)} bytes)')
