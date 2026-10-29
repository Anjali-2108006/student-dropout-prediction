import os

def write(path, content):
    full = os.path.abspath(path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as out:
        out.write(content.strip() + '\n')
    print('Created:', path)
import base64
