import os
import sys
import re
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:left w:val="none"/><w:right w:val="none"/><w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/><w:insideV w:val="none"/></w:tblBorders>')
        tblPr[0].append(borders)

class BlackbookBuilder:
    def __init__(self, output_path):
        self.output_path = output_path
        self.doc = Document()
        self.setup_page_properties()
        self.setup_styles()

    def setup_page_properties(self):
        section = self.doc.sections[0]
        # US Letter (8.5 x 11.0 inches) with ~3 cm (1.18 in) top/left and ~2 cm (0.79 in) right margins
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)
        section.top_margin = Inches(1.181)    # 3.0 cm top margin
        section.bottom_margin = Inches(0.866) # 2.2 cm bottom margin
        section.left_margin = Inches(1.181)   # 3.0 cm left binding margin
        section.right_margin = Inches(0.787)  # 2.0 cm right margin
        section.different_first_page_header_footer = True

        # Solid black page border around the page (SBMP Project Report Standard)
        sectPr = section._sectPr
        existing_borders = sectPr.xpath('w:pgBorders')
        if existing_borders:
            for b in existing_borders:
                sectPr.remove(b)
        pgBorders = parse_xml(
            f'<w:pgBorders {nsdecls("w")} w:offsetFrom="page">'
            f'<w:top w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
            f'<w:left w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
            f'<w:bottom w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
            f'<w:right w:val="single" w:sz="12" w:space="24" w:color="000000"/>'
            f'</w:pgBorders>'
        )
        sectPr.append(pgBorders)

        # Header: clean empty header matching reference standard
        header = section.header
        hp = header.paragraphs[0]
        hp.text = ""

        # Footer: Centered page number field matching reference standard
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = ""
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_f = fp.add_run()
        fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
        instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
        fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
        fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
        run_f._r.append(fldChar1)
        run_f._r.append(instrText)
        run_f._r.append(fldChar2)
        run_f._r.append(fldChar3)
        run_f.font.name = "Times New Roman"
        run_f.font.size = Pt(11)
        run_f.font.color.rgb = RGBColor(0, 0, 0)

    def setup_styles(self):
        styles = self.doc.styles
        normal = styles['Normal']
        normal.font.name = 'Times New Roman'
        normal.font.size = Pt(12)
        normal.font.color.rgb = RGBColor(0, 0, 0)
        normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        normal.paragraph_format.line_spacing = 1.15
        normal.paragraph_format.space_after = Pt(6)

    def add_chapter_title(self, text, subtitle=None):
        clean_text = text.strip()
        if ":" in clean_text and clean_text.upper().startswith("CHAPTER"):
            parts = clean_text.split(":", 1)
            ch_num = parts[0].strip().title()  # e.g. "Chapter 1"
            ch_title = parts[1].strip()

            # Canonical clean chapter title in Title Case
            ch_title_clean = ch_title.title()
            for word, repl in [("Iot", "IoT"), ("Ai", "AI"), ("Uml", "UML"), ("Bom", "BOM")]:
                ch_title_clean = re.sub(rf'\b{word}\b', repl, ch_title_clean)

            # "Chapter N" centered with generous top space matching reference
            p_num = self.doc.add_paragraph()
            p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_num.paragraph_format.space_before = Pt(80)
            p_num.paragraph_format.space_after = Pt(24)
            r_num = p_num.add_run(ch_num)
            r_num.bold = True
            r_num.font.name = "Times New Roman"
            r_num.font.size = Pt(18)
            r_num.font.color.rgb = RGBColor(0, 0, 0)

            # Chapter Title centered, large font (30pt)
            p_title = self.doc.add_paragraph()
            p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_title.paragraph_format.space_before = Pt(0)
            p_title.paragraph_format.space_after = Pt(36)
            r_title = p_title.add_run(ch_title_clean)
            r_title.bold = True
            r_title.font.name = "Times New Roman"
            r_title.font.size = Pt(30)
            r_title.font.color.rgb = RGBColor(0, 0, 0)
        else:
            # Non-chapter major title like "ABSTRACT", "REFERENCES", "ACKNOWLEDGEMENT"
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(36)
            p.paragraph_format.space_after = Pt(20)
            run = p.add_run(clean_text)
            run.bold = True
            run.font.name = "Times New Roman"
            run.font.size = Pt(20)
            run.font.color.rgb = RGBColor(0, 0, 0)

        if subtitle:
            p_sub = self.doc.add_paragraph()
            p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_sub.paragraph_format.space_before = Pt(0)
            p_sub.paragraph_format.space_after = Pt(14)
            run_sub = p_sub.add_run(subtitle)
            run_sub.font.name = "Times New Roman"
            run_sub.font.size = Pt(11)
            run_sub.font.italic = True
            run_sub.font.color.rgb = RGBColor(71, 85, 105)

    def add_heading_1(self, text):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_2(self, text):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_3(self, text):
        p = self.doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.bold = True
        run.font.name = "Times New Roman"
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_p(self, text, bold_prefix="", italic=False, space_after=6, indent=True):
        # If text contains multiple paragraphs separated by \n\n or \n
        paragraphs_text = [pt.strip() for pt in text.split('\n\n') if pt.strip()]
        if not paragraphs_text:
            paragraphs_text = [text]

        last_p = None
        for idx, p_text in enumerate(paragraphs_text):
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            if indent:
                p.paragraph_format.first_line_indent = Inches(0.5)
            p.paragraph_format.space_after = Pt(space_after)
            p.paragraph_format.line_spacing = 1.15

            # Bold prefix only on the first paragraph
            if idx == 0 and bold_prefix:
                run_b = p.add_run(bold_prefix)
                run_b.bold = True
                run_b.font.name = "Times New Roman"
                run_b.font.color.rgb = RGBColor(0, 0, 0)

            # Clean any internal single newlines that should just be spaces
            clean_body = " ".join([line.strip() for line in p_text.split('\n') if line.strip()])

            run_t = p.add_run(clean_body)
            run_t.font.name = "Times New Roman"
            run_t.italic = italic
            run_t.font.color.rgb = RGBColor(0, 0, 0)
            last_p = p

        return last_p

    def add_bullet(self, text, bold_prefix=""):
        p = self.doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.bold = True
            run_b.font.name = "Times New Roman"
            run_b.font.color.rgb = RGBColor(0, 0, 0)
        run_t = p.add_run(text)
        run_t.font.name = "Times New Roman"
        run_t.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_callout(self, text, title="NOTE"):
        tbl = self.doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="18" w:space="0" w:color="000000"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
        tcPr.append(borders)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_after = Pt(0)
        r_title = p.add_run(f"[{title}] ")
        r_title.bold = True
        r_title.font.name = "Times New Roman"
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = RGBColor(0, 0, 0)
        r_text = p.add_run(text)
        r_text.font.name = "Times New Roman"
        r_text.font.size = Pt(10)
        r_text.font.color.rgb = RGBColor(0, 0, 0)
        p_sp = self.doc.add_paragraph()
        p_sp.paragraph_format.space_after = Pt(4)

    def add_code(self, code_text, filename=""):
        tbl = self.doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
        tcPr = cell._element.get_or_add_tcPr()
        borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="12" w:space="0" w:color="000000"/><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tcBorders>')
        tcPr.append(borders)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        if filename:
            r_fn = p.add_run(f"// File: {filename}\n")
            r_fn.bold = True
            r_fn.font.name = "Consolas"
            r_fn.font.size = Pt(8.5)
            r_fn.font.color.rgb = RGBColor(0, 0, 0)
        r_code = p.add_run(code_text)
        r_code.font.name = "Consolas"
        r_code.font.size = Pt(8.5)
        r_code.font.color.rgb = RGBColor(0, 0, 0)
        p_sp = self.doc.add_paragraph()
        p_sp.paragraph_format.space_after = Pt(4)

    def add_figure(self, img_path, caption, width_inches=5.8, max_height_inches=7.5):
        if os.path.exists(img_path):
            try:
                from PIL import Image
                with Image.open(img_path) as im:
                    w_px, h_px = im.size
                    aspect = h_px / w_px
            except Exception:
                aspect = 0.75

            target_width = width_inches
            target_height = target_width * aspect
            if target_height > max_height_inches:
                target_height = max_height_inches
                target_width = target_height / aspect

            p_img = self.doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            run = p_img.add_run()
            run.add_picture(img_path, width=Inches(target_width), height=Inches(target_height))

            p_cap = self.doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(10)
            run_cap = p_cap.add_run(caption)
            run_cap.font.name = "Times New Roman"
            run_cap.font.size = Pt(10)
            run_cap.font.italic = True
            run_cap.font.color.rgb = RGBColor(0, 0, 0)
        else:
            self.add_callout(f"Image not found at path: {img_path}. Placeholder allocated.", "MISSING ASSET")

    def add_table(self, headers, rows, col_widths=None, caption=None):
        table = self.doc.add_table(rows=len(rows)+1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)

        # Header row
        hdr_cells = table.rows[0].cells
        for i, title in enumerate(headers):
            hdr_cells[i].text = title
            set_cell_background(hdr_cells[i], "0F172A") # Slate-900
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.bold = True
                r.font.name = "Times New Roman"
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(255, 255, 255)

        # Data rows
        for r_idx, row in enumerate(rows):
            row_cells = table.rows[r_idx+1].cells
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                p = row_cells[c_idx].paragraphs[0]
                for r in p.runs:
                    r.font.name = "Times New Roman"
                    r.font.size = Pt(9)
                    r.font.color.rgb = RGBColor(0, 0, 0)

        if col_widths:
            for row in table.rows:
                for idx, w in enumerate(col_widths):
                    row.cells[idx].width = Inches(w)

        if caption:
            p_cap = self.doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(4)
            p_cap.paragraph_format.space_after = Pt(10)
            run_cap = p_cap.add_run(caption)
            run_cap.font.name = "Times New Roman"
            run_cap.font.size = Pt(9.5)
            run_cap.font.bold = True
            run_cap.font.color.rgb = RGBColor(0, 0, 0)
        else:
            p_sp = self.doc.add_paragraph()
            p_sp.paragraph_format.space_after = Pt(4)

    def save(self):
        self.doc.save(self.output_path)
        print(f"Document saved successfully at: {self.output_path} ({os.path.getsize(self.output_path)} bytes)")

print("BlackbookBuilder class ready.")
