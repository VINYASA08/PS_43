import os

def update_login():
    path = 'shared/src/commonMain/kotlin/screens/LoginScreen.kt'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('Text("Jharkhand Smart Study"', 'Text(localization.LocalLocalization.current.strings.appTitle')
    content = content.replace('Text("Mobile Field Application"', 'Text(localization.LocalLocalization.current.strings.mobileFieldApplication')
    content = content.replace('Text("Login as Citizen"', 'Text(localization.LocalLocalization.current.strings.loginAsCitizen')
    content = content.replace('Text("Login as Local Sarpanch"', 'Text(localization.LocalLocalization.current.strings.loginAsSarpanch')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_login()
print("Done Login")
