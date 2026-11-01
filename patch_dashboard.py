import re

path = 'enersense-website/src/pages/DashboardPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. 50% fallback -> 0%
text = text.replace(': 50;', ': 0;')

# 2. 239 V -> Offline when 0
text = text.replace('{liveVoltage || 239} V', "{liveVoltage > 0 ? `${liveVoltage} V` : 'Offline'}")

# 3. Dynamic Appliance names
text = text.replace('Smart AC (Relay 1)', "{appliances.find(a => a.channel === 1 || a.id === 1)?.name || 'Appliance 1'} (Relay 1)")
text = text.replace('OLED TV (Relay 2)', "{appliances.find(a => a.channel === 2 || a.id === 2)?.name || 'Appliance 2'} (Relay 2)")

# 4. Zeroed Daily Usage chart (only shows Today when live, 0 for past empty days)
old_chart = re.search(r'const dynamicUsageData = \[[\s\S]*?\];', text).group(0)
new_chart = """const dynamicUsageData = [
    { name: 'Mon', value: 0 },
    { name: 'Tue', value: 0 },
    { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 },
    { name: 'Fri', value: 0 },
    { name: 'Sat', value: 0 },
    { name: 'Today', value: Math.round((parseFloat(liveEnergy) || 0) * 1000) },
  ];"""
text = text.replace(old_chart, new_chart)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('DashboardPage updated cleanly!')
