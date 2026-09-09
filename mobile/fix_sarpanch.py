import os

path = 'shared/src/commonMain/kotlin/screens/SarpanchVerifyScreen.kt'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Text("Issue #$index: Road Damage"', 'Text("समस्या #$index: Road Damage" /* mock */')
content = content.replace('Text("Submitted 2 hours ago by Citizen"', 'Text("नागरिक द्वारा 2 घंटे पहले प्रस्तुत" /* mock */')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
