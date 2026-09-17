#!/usr/bin/env python3
"""Convert markdown PRD to PDF with proper styling"""

import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def parse_markdown_to_pdf_elements(md_content):
    """Parse markdown and convert to reportlab elements"""
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=30,
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=12,
        spaceBefore=12
    ))
    
    styles.add(ParagraphStyle(
        name='CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#34495e'),
        spaceAfter=10,
        spaceBefore=10
    ))
    
    styles.add(ParagraphStyle(
        name='CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#7f8c8d'),
        spaceAfter=8,
        spaceBefore=8
    ))
    
    styles.add(ParagraphStyle(
        name='CustomCode',
        parent=styles['Code'],
        fontSize=9,
        textColor=colors.HexColor('#c7254e'),
        backColor=colors.HexColor('#f9f2f4'),
        leftIndent=20
    ))
    
    elements = []
    lines = md_content.split('\n')
    i = 0
    in_table = False
    table_rows = []
    
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Skip empty lines
        if not line:
            if not in_table:
                elements.append(Spacer(1, 0.1*inch))
            i += 1
            continue
        
        # Title (first # line)
        if line.startswith('# ') and i < 5:
            text = line[2:].strip()
            elements.append(Paragraph(text, styles['CustomTitle']))
            elements.append(Spacer(1, 0.3*inch))
            i += 1
            continue
        
        # Headings
        if line.startswith('#### '):
            text = line[5:].strip()
            elements.append(Paragraph(text, styles['CustomHeading3']))
            i += 1
            continue
        elif line.startswith('### '):
            text = line[4:].strip()
            elements.append(Paragraph(text, styles['CustomHeading2']))
            i += 1
            continue
        elif line.startswith('## '):
            text = line[3:].strip()
            elements.append(Paragraph(text, styles['CustomHeading1']))
            i += 1
            continue
        elif line.startswith('# '):
            text = line[2:].strip()
            elements.append(Paragraph(text, styles['CustomHeading1']))
            i += 1
            continue
        
        # Horizontal rule
        if line.startswith('---'):
            elements.append(Spacer(1, 0.2*inch))
            i += 1
            continue
        
        # Tables
        if '|' in line and not in_table:
            in_table = True
            table_rows = []
        
        if in_table:
            if '|' in line:
                # Parse table row
                cells = [c.strip() for c in line.split('|')]
                cells = [c for c in cells if c]  # Remove empty cells
                
                # Skip separator row
                if cells and not all(set(c) <= set('-: ') for c in cells):
                    table_rows.append(cells)
                
                i += 1
                continue
            else:
                # End of table
                if table_rows:
                    # Create table
                    t = Table(table_rows)
                    t.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3498db')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ]))
                    elements.append(t)
                    elements.append(Spacer(1, 0.2*inch))
                in_table = False
                table_rows = []
                continue
        
        # Bullet lists
        if line.startswith('- ') or line.startswith('* '):
            text = line[2:].strip()
            # Clean markdown bold/italic
            text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
            text = re.sub(r'`(.+?)`', r'<font color="#c7254e" face="Courier">\1</font>', text)
            para = Paragraph(f'• {text}', styles['Normal'])
            elements.append(para)
            i += 1
            continue
        
        # Code blocks
        if line.startswith('```'):
            i += 1
            code_lines = []
            while i < len(lines) and not lines[i].startswith('```'):
                code_lines.append(lines[i])
                i += 1
            if code_lines:
                code_text = '<br/>'.join(code_lines)
                elements.append(Paragraph(code_text, styles['CustomCode']))
                elements.append(Spacer(1, 0.1*inch))
            i += 1
            continue
        
        # Bold text in metadata
        if line.startswith('**') and '**:' in line:
            text = line.replace('**', '<b>', 1).replace('**', '</b>', 1)
            elements.append(Paragraph(text, styles['Normal']))
            i += 1
            continue
        
        # Regular paragraphs
        text = line
        # Clean markdown formatting
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
        text = re.sub(r'`(.+?)`', r'<font color="#c7254e" face="Courier">\1</font>', text)
        
        if text:
            elements.append(Paragraph(text, styles['Normal']))
        
        i += 1
    
    return elements

def main():
    input_file = '/Users/tfj/Documents/Projek Hermes/SIAKAD-Microservice/PRD-SIAKAD.md'
    output_file = '/Users/tfj/Documents/Projek Hermes/SIAKAD-Microservice/PRD-SIAKAD.pdf'
    
    # Read markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Create PDF
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )
    
    # Parse and build
    elements = parse_markdown_to_pdf_elements(md_content)
    
    # Build PDF
    doc.build(elements)
    
    print(f"✅ PDF created: {output_file}")

if __name__ == '__main__':
    main()
