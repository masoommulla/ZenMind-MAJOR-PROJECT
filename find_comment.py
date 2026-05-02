import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

f = open('src/app/components/Dashboard.tsx', encoding='utf-8')
content = f.read()
f.close()

idx = content.find('SIDEBAR wrapper')
ctx = content[idx-15:idx+80]
print(repr(ctx))
