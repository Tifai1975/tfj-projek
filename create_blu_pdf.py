#!/usr/bin/env python3
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
import os

# Read the markdown content
with open('/Users/tfj/Documents/Projek Hermes/BLU-Perencanaan-Kinerja.md', 'r') as f:
    content = f.read()

# Split content into lines
lines = content.split('\n')

# Setup document
doc = SimpleDocTemplate("/Users/tfj/Documents/Projek Hermes/BLU-Perencanaan-Kinerja.pdf", pagesize=letter,
                        rightMargin=72, leftMargin=72,
                        topMargin=72, bottomMargin=18)
styles = getSampleStyleSheet()
styleN = styles['Normal']
styleH = styles['Heading1']
styleH2 = styles['Heading2']
styleH3 = styles['Heading3']

# Build story
story = []
for line in lines:
    if line.startswith('# '):
        story.append(Paragraph(line[2:], styleH))
        story.append(Spacer(1, 12))
    elif line.startswith('## '):
        story.append(Paragraph(line[3:], styleH2))
        story.append(Spacer(1, 12))
    elif line.startswith('### '):
        story.append(Paragraph(line[4:], styleH3))
        story.append(Spacer(1, 8))
    elif line.strip() == '':
        story.append(Spacer(1, 12))
    else:
        story.append(Paragraph(line, styleN))
        story.append(Spacer(1, 6))

# Build PDF
doc.build(story)
print("PDF created successfully.")