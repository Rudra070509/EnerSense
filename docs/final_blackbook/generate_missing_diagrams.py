import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

os.makedirs('docs/final_blackbook', exist_ok=True)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# ------------------------------------------------------------------------------
# 1. EXACT 15-PHASE GANTT CHART (Fig. 8 / Fig. 6.10) MATCHING USER CSV & PDF
# ------------------------------------------------------------------------------
def generate_exact_gantt():
    fig, ax = plt.subplots(figsize=(15, 10), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    ax.text(0.5, 0.96, "FIGURE 6.10: PROJECT GANTT CHART (PROPOSED SCHEDULE)", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a')
    ax.text(0.5, 0.93, "Proposed Project Schedule in Weeks Relative to Project Start (15 Development Phases Across 12 Weeks)", 
            ha='center', va='center', fontsize=10, fontstyle='italic', color='#475569')

    phases = [
        (1, "Project selection and synopsis", 1, 1, "Placeholder"),
        (2, "Literature review", 1, 2, "Placeholder"),
        (3, "Requirement analysis", 1, 1, "Synopsis"),
        (4, "Hardware component procurement", 2, 2, "Placeholder"),
        (5, "Circuit assembly and sensor testing", 4, 2, "Synopsis"),
        (6, "ESP32 firmware development", 5, 3, "Synopsis"),
        (7, "Communication and backend development", 7, 2, "Synopsis"),
        (8, "Database integration", 7, 2, "Synopsis"),
        (9, "Dashboard development", 2, 2, "Synopsis"),
        (10, "Electricity bill calculation", 8, 1, "Synopsis"),
        (11, "Gemini API integration (if implemented)", 9, 1, "Synopsis"),
        (12, "System integration", 9, 2, "Synopsis"),
        (13, "Testing and troubleshooting", 9, 3, "Synopsis"),
        (14, "Documentation and blackbook preparation", 11, 2, "Synopsis"),
        (15, "Final review and demonstration", 12, 1, "Placeholder")
    ]

    # Table layout coordinates
    top = 0.88
    row_h = 0.048
    left_no = 0.03
    w_no = 0.03
    left_phase = 0.06
    w_phase = 0.28
    left_start = 0.34
    w_start = 0.04
    left_dur = 0.38
    w_dur = 0.04
    left_done = 0.42
    w_done = 0.04
    grid_left = 0.46
    grid_w = 0.51
    col_w = grid_w / 12.0

    # Header Row
    headers = [
        (left_no, w_no, "No"),
        (left_phase, w_phase, "Phase"),
        (left_start, w_start, "Start"),
        (left_dur, w_dur, "Dur."),
        (left_done, w_done, "Done")
    ]
    for x, w, txt in headers:
        rect = patches.Rectangle((x, top), w, row_h, facecolor='#1e293b', edgecolor='#334155', linewidth=1)
        ax.add_patch(rect)
        ax.text(x + w/2, top + row_h/2, txt, ha='center', va='center', fontsize=9, fontweight='bold', color='white')

    for w_idx in range(1, 13):
        gx = grid_left + (w_idx - 1) * col_w
        rect = patches.Rectangle((gx, top), col_w, row_h, facecolor='#1e293b', edgecolor='#334155', linewidth=1)
        ax.add_patch(rect)
        ax.text(gx + col_w/2, top + row_h/2, f"W{w_idx}", ha='center', va='center', fontsize=9, fontweight='bold', color='white')

    # Rows
    for idx, (num, name, start, dur, src) in enumerate(phases):
        y = top - (idx + 1) * row_h
        bg_col = '#f8fafc' if idx % 2 == 0 else '#ffffff'

        # Text cells
        r_no = patches.Rectangle((left_no, y), w_no, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)
        r_phase = patches.Rectangle((left_phase, y), w_phase, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)
        r_start = patches.Rectangle((left_start, y), w_start, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)
        r_dur = patches.Rectangle((left_dur, y), w_dur, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)
        r_done = patches.Rectangle((left_done, y), w_done, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)

        for r in [r_no, r_phase, r_start, r_dur, r_done]:
            ax.add_patch(r)

        ax.text(left_no + w_no/2, y + row_h/2, str(num), ha='center', va='center', fontsize=8.5, color='#0f172a')
        ax.text(left_phase + 0.01, y + row_h/2, name, ha='left', va='center', fontsize=8.5, color='#0f172a', fontweight='500')
        ax.text(left_start + w_start/2, y + row_h/2, str(start), ha='center', va='center', fontsize=8.5, color='#475569')
        ax.text(left_dur + w_dur/2, y + row_h/2, str(dur), ha='center', va='center', fontsize=8.5, color='#475569')
        ax.text(left_done + w_done/2, y + row_h/2, "100%", ha='center', va='center', fontsize=8.5, color='#16a34a', fontweight='bold')

        # Grid cells
        for w_idx in range(1, 13):
            gx = grid_left + (w_idx - 1) * col_w
            rect = patches.Rectangle((gx, y), col_w, row_h, facecolor=bg_col, edgecolor='#cbd5e1', linewidth=0.8)
            ax.add_patch(rect)

        # Bar
        bx = grid_left + (start - 1) * col_w
        bw = dur * col_w
        bar_color = '#1e40af' if src == "Synopsis" else '#f59e0b'
        edge_color = '#172554' if src == "Synopsis" else '#b45309'
        bar = patches.Rectangle((bx + 0.002, y + 0.006), bw - 0.004, row_h - 0.012, 
                                facecolor=bar_color, edgecolor=edge_color, linewidth=1, zorder=3)
        ax.add_patch(bar)

    # Legend
    leg_y = top - 16.5 * row_h
    r_syn = patches.Rectangle((0.15, leg_y), 0.04, 0.025, facecolor='#1e40af', edgecolor='#172554')
    ax.add_patch(r_syn)
    ax.text(0.20, leg_y + 0.012, "Follows synopsis development modules (Core Features)", va='center', fontsize=9, color='#0f172a')

    r_pl = patches.Rectangle((0.55, leg_y), 0.04, 0.025, facecolor='#f59e0b', edgecolor='#b45309')
    ax.add_patch(r_pl)
    ax.text(0.60, leg_y + 0.012, "Preparatory & Review phases (Project lifecycle milestones)", va='center', fontsize=9, color='#0f172a')

    ax.text(0.5, 0.03, 
            "Caption: Figure 6.10 illustrates the project schedule across 15 development phases mapped over the 12-week development cycle,\n"
            "contrasting core synopsis development modules with preparatory and final defense milestones.",
            ha='center', va='center', fontsize=8.5, fontstyle='italic', color='#475569')

    plt.tight_layout()
    plt.savefig('docs/final_blackbook/diagram_08_project_gantt_chart.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: diagram_08_project_gantt_chart.png (Exact 15-phase version)")

# ------------------------------------------------------------------------------
# 2. SYSTEM BLOCK DIAGRAM (Fig. 4.1)
# ------------------------------------------------------------------------------
def generate_system_block_diagram():
    fig, ax = plt.subplots(figsize=(13, 8), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    ax.text(0.5, 0.95, "FIGURE 4.1: OVERALL SYSTEM BLOCK DIAGRAM", 
            ha='center', va='center', fontsize=15, fontweight='bold', color='#0f172a')
    ax.text(0.5, 0.915, "Modular Interconnections between High-Voltage Mains, Edge Controller, Cloud Broker, and Web Client", 
            ha='center', va='center', fontsize=10, fontstyle='italic', color='#475569')

    def draw_box(xy, w, h, text, fc='#ffffff', ec='#64748b', tc='#0f172a', fs=9, fw='normal'):
        box = FancyBboxPatch(xy, w, h, boxstyle="round,pad=0.2", facecolor=fc, edgecolor=ec, linewidth=1.5, zorder=3)
        ax.add_patch(box)
        cx = xy[0] + w/2
        cy = xy[1] + h/2
        ax.text(cx, cy, text, ha='center', va='center', fontsize=fs, color=tc, fontweight=fw, multialignment='center', zorder=4)
        return (cx, cy), (xy[0], xy[1], w, h)

    def draw_arrow(start, end, text="", color="#334155"):
        arr = FancyArrowPatch(start, end, arrowstyle='-|>', color=color, linewidth=1.5, mutation_scale=12, zorder=2)
        ax.add_patch(arr)
        if text:
            mx = (start[0] + end[0])/2
            my = (start[1] + end[1])/2 + 0.02
            ax.text(mx, my, text, ha='center', va='center', fontsize=8, color=color, backgroundcolor='white', zorder=5)

    # 1. AC Mains Supply
    c_mains, b_mains = draw_box((0.05, 0.55), 0.16, 0.22, "230V AC Mains Supply\n(Single Phase, 50Hz)\n\n• Live (L) & Neutral (N)\n• 6A Protection Fuse\n• Star Terminal Block", fc='#fee2e2', ec='#ef4444', tc='#991b1b', fw='bold')

    # 2. Sensing Block (Dual PZEM)
    c_pzem, b_pzem = draw_box((0.27, 0.68), 0.20, 0.18, "PZEM-004T V3.0 (x2)\nEnergy Metering Sensors\n\n• Open-Core CT Coils\n• SD3004 Metering IC\n• 2500V Optocouplers", fc='#e0f2fe', ec='#0284c7', tc='#0369a1', fw='bold')

    # 3. Actuation Block (Relay)
    c_relay, b_relay = draw_box((0.27, 0.38), 0.20, 0.18, "2-Channel 5V Relay Module\n(Songle SRD-05VDC)\n\n• PC817 Optocouplers\n• Active-LOW Drivers\n• 10A 250V Contacts", fc='#fef3c7', ec='#d97706', tc='#92400e', fw='bold')

    # 4. Connected Loads
    c_loads, b_loads = draw_box((0.05, 0.20), 0.16, 0.22, "Demonstration Loads\n(Household Branches)\n\n• Bulb 1 (Smart AC)\n• Bulb 2 (OLED TV)\n• Switched AC Sockets", fc='#f8fafc', ec='#64748b', tc='#334155')

    # 5. ESP32 Edge Gateway
    c_esp, b_esp = draw_box((0.53, 0.45), 0.18, 0.32, "ESP32 DevKit V1\nEdge Microcontroller\n\n• Xtensa Dual-Core 240MHz\n• Dual UARTs (Pins 16/17, 18/19)\n• Active-LOW GPIOs (26, 27)\n• PubSubClient MQTT Stack\n• ArduinoJson Serializer", fc='#dcfce7', ec='#16a34a', tc='#166534', fw='bold')

    # 6. MQTT Broker
    c_mqtt, b_mqtt = draw_box((0.77, 0.65), 0.18, 0.18, "HiveMQ Cloud Broker\n(Public Cluster)\n\n• broker.hivemq.com\n• Port 1883 TCP (MQTT)\n• Port 8000 WebSockets\n• enersense/telemetry\n• enersense/commands", fc='#ffedd5', ec='#ea580c', tc='#9a3412', fw='bold')

    # 7. Web Application & AI
    c_app, b_app = draw_box((0.77, 0.25), 0.18, 0.25, "React 18 Dashboard &\nCognitive Services\n\n• Glassmorphism UI\n• Recharts Live Power\n• MERC LT-I (B) Billing\n• Google Gemini AI\n• Neon PostgreSQL", fc='#fae8ff', ec='#c026d3', tc='#86198f', fw='bold')

    # Arrows
    draw_arrow((b_mains[0] + b_mains[2], c_pzem[1]), (b_pzem[0], c_pzem[1]), "Live Pass-Through")
    draw_arrow((b_pzem[0] + b_pzem[2], c_pzem[1]), (b_esp[0], c_pzem[1]), "UART Modbus RTU")
    draw_arrow((b_esp[0], c_relay[1]), (b_relay[0] + b_relay[2], c_relay[1]), "Active-LOW GPIOs")
    draw_arrow((b_relay[0], c_relay[1]), (b_loads[0] + b_loads[2], c_loads[1]), "NO/COM 230V")
    draw_arrow((b_esp[0] + b_esp[2], c_esp[1] + 0.08), (b_mqtt[0], c_mqtt[1]), "Publish (1883)")
    draw_arrow((b_mqtt[0], c_mqtt[1] - 0.05), (b_esp[0] + b_esp[2], c_esp[1] + 0.02), "Commands")
    draw_arrow((c_mqtt[0], b_mqtt[1]), (c_app[0], b_app[1] + b_app[3]), "WebSockets (8000)")
    draw_arrow((c_app[0] + 0.03, b_app[1] + b_app[3]), (c_mqtt[0] + 0.03, b_mqtt[1]), "Relay Commands")

    ax.text(0.5, 0.05, 
            "Caption: Figure 4.1 details the multi-tier system block diagram of the Home Energy Optimizer, illustrating the physical AC mains interface,\n"
            "isolated sensing and relay switching, ESP32 edge processing, HiveMQ cloud broker distribution, and the React web dashboard.",
            ha='center', va='center', fontsize=8.5, fontstyle='italic', color='#475569')

    plt.tight_layout()
    plt.savefig('docs/final_blackbook/diagram_04_1_system_block_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: diagram_04_1_system_block_diagram.png")

# ------------------------------------------------------------------------------
# 3. DATA FLOW DIAGRAMS (Fig. 6.8a Level 0 & Fig. 6.8b Level 1)
# ------------------------------------------------------------------------------
def generate_dfd_diagrams():
    # Level 0 DFD
    fig, ax = plt.subplots(figsize=(12, 7), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    ax.text(0.5, 0.94, "FIGURE 6.8a: DATA-FLOW DIAGRAM (LEVEL 0 — CONTEXT DIAGRAM)", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')

    # Entities
    def draw_entity(xy, w, h, text):
        rect = patches.Rectangle(xy, w, h, facecolor='#f1f5f9', edgecolor='#475569', linewidth=1.5, zorder=3)
        ax.add_patch(rect)
        ax.text(xy[0] + w/2, xy[1] + h/2, text, ha='center', va='center', fontsize=9, fontweight='bold', color='#0f172a')
        return (xy[0] + w/2, xy[1] + h/2)

    # Process Circle
    def draw_process(xy, r, text):
        circle = patches.Circle(xy, r, facecolor='#e0f2fe', edgecolor='#0284c7', linewidth=2, zorder=3)
        ax.add_patch(circle)
        ax.text(xy[0], xy[1], text, ha='center', va='center', fontsize=9, fontweight='bold', color='#0369a1', multialignment='center')

    c_proc = (0.5, 0.5)
    draw_process(c_proc, 0.15, "0.0\nHome Energy\nOptimizer\nSystem")

    e_user = draw_entity((0.08, 0.42), 0.18, 0.16, "Household User\n(Resident)")
    e_hw = draw_entity((0.41, 0.08), 0.18, 0.14, "ESP32 & Sensors\n(Edge Hardware)")
    e_ai = draw_entity((0.74, 0.42), 0.18, 0.16, "Google Gemini AI\n(External Service)")

    def draw_dfd_arrow(start, end, text, rad=0.1):
        arr = FancyArrowPatch(start, end, arrowstyle='-|>', color='#334155', linewidth=1.4, 
                                mutation_scale=12, connectionstyle=f"arc3,rad={rad}", zorder=2)
        ax.add_patch(arr)
        mx = (start[0] + end[0])/2
        my = (start[1] + end[1])/2 + rad*0.3
        ax.text(mx, my, text, ha='center', va='center', fontsize=8, color='#334155', backgroundcolor='white', zorder=4)

    draw_dfd_arrow((e_user[0] + 0.09, e_user[1] + 0.04), (c_proc[0] - 0.14, c_proc[1] + 0.04), "Relay ON/OFF Commands", rad=-0.1)
    draw_dfd_arrow((c_proc[0] - 0.14, c_proc[1] - 0.04), (e_user[0] + 0.09, e_user[1] - 0.04), "Live Readings, Bill & Advice", rad=-0.1)

    draw_dfd_arrow((e_hw[0] - 0.03, e_hw[1] + 0.07), (c_proc[0] - 0.05, c_proc[1] - 0.14), "Modbus Telemetry (V, I, P, E)", rad=0.1)
    draw_dfd_arrow((c_proc[0] + 0.05, c_proc[1] - 0.14), (e_hw[0] + 0.03, e_hw[1] + 0.07), "Actuation Commands", rad=0.1)

    draw_dfd_arrow((c_proc[0] + 0.14, c_proc[1] + 0.04), (e_ai[0] - 0.09, e_ai[1] + 0.04), "Usage Summary Prompt", rad=-0.1)
    draw_dfd_arrow((e_ai[0] - 0.09, e_ai[1] - 0.04), (c_proc[0] + 0.14, c_proc[1] - 0.04), "AI Optimization Advice", rad=-0.1)

    ax.text(0.5, 0.02, "Caption: Figure 6.8a shows the Level 0 Context Data-Flow Diagram, displaying system interactions with the User, Edge Hardware, and Gemini AI.", ha='center', va='center', fontsize=8.5, fontstyle='italic', color='#475569')

    plt.tight_layout()
    plt.savefig('docs/final_blackbook/diagram_08a_dfd_level_0.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: diagram_08a_dfd_level_0.png")

# ------------------------------------------------------------------------------
# 4. SEQUENCE DIAGRAM (Fig. 6.9)
# ------------------------------------------------------------------------------
def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(14, 9), dpi=300)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    ax.text(0.5, 0.96, "FIGURE 6.9: SYSTEM SEQUENCE DIAGRAM", 
            ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a')
    ax.text(0.5, 0.925, "Time-Ordered Message Sequence for Telemetry Polling, Bill Projection, AI Advisory, and Relay Control", 
            ha='center', va='center', fontsize=9.5, fontstyle='italic', color='#475569')

    lifelines = [
        ("User", 0.08),
        ("React UI", 0.24),
        ("HiveMQ Broker", 0.40),
        ("ESP32 Edge", 0.56),
        ("PZEM / Relays", 0.72),
        ("Gemini AI", 0.88)
    ]

    for name, x in lifelines:
        box = FancyBboxPatch((x - 0.06, 0.85), 0.12, 0.04, boxstyle="round,pad=0.1", facecolor='#1e293b', edgecolor='#0f172a')
        ax.add_patch(box)
        ax.text(x, 0.87, name, ha='center', va='center', fontsize=9, fontweight='bold', color='white')
        ax.plot([x, x], [0.10, 0.85], linestyle='--', color='#94a3b8', linewidth=1.2, zorder=1)

    def draw_msg(y, x1, x2, label, dashed=False, color='#0284c7'):
        ls = '--' if dashed else '-'
        arr = FancyArrowPatch((x1, y), (x2, y), arrowstyle='-|>', color=color, linewidth=1.4, linestyle=ls, mutation_scale=11, zorder=2)
        ax.add_patch(arr)
        mx = (x1 + x2)/2
        ax.text(mx, y + 0.015, label, ha='center', va='center', fontsize=8, color='#0f172a', backgroundcolor='white', zorder=3)

    # Telemetry flow
    draw_msg(0.80, 0.56, 0.72, "1: Modbus FC 0x04 Read Registers")
    draw_msg(0.75, 0.72, 0.56, "2: Return V, I, P, E (0.5% Class)", dashed=True)
    draw_msg(0.70, 0.56, 0.40, "3: MQTT Publish enersense/telemetry (1883)")
    draw_msg(0.65, 0.40, 0.24, "4: WebSocket Stream (Port 8000)")
    draw_msg(0.60, 0.24, 0.24, "5: Calculate MERC Slabs & Update Charts (Internal)")
    draw_msg(0.55, 0.24, 0.08, "6: Render Live Dashboard & Bill Estimate")

    # AI flow
    draw_msg(0.48, 0.08, 0.24, "7: Submit Chat Query 'How to save?'")
    draw_msg(0.43, 0.24, 0.88, "8: HTTPS POST gemini-3.5-flash (Injected Context)")
    draw_msg(0.38, 0.88, 0.24, "9: Natural Language Optimization Advice", dashed=True)
    draw_msg(0.33, 0.24, 0.08, "10: Display AI Bubble on GlassCard")

    # Actuation flow
    draw_msg(0.26, 0.08, 0.24, "11: Click Toggle Switch Appliance 1 (ON)")
    draw_msg(0.21, 0.24, 0.40, "12: Publish enersense/commands {id:1, state:ON}")
    draw_msg(0.16, 0.40, 0.56, "13: MQTT Callback Dispatches Command")
    draw_msg(0.11, 0.56, 0.72, "14: digitalWrite(GPIO 26, LOW) -> Relay Clicks ON")

    ax.text(0.5, 0.04, "Caption: Figure 6.9 demonstrates the time-ordered sequence of interactions across all six architectural lifelines for telemetry streaming, AI advisory, and remote relay control.", ha='center', va='center', fontsize=8.5, fontstyle='italic', color='#475569')

    plt.tight_layout()
    plt.savefig('docs/final_blackbook/diagram_09_sequence_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated: diagram_09_sequence_diagram.png")

if __name__ == '__main__':
    generate_exact_gantt()
    generate_system_block_diagram()
    generate_dfd_diagrams()
    generate_sequence_diagram()
