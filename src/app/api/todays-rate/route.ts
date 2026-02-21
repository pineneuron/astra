import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { ProductService } from '@/lib/services';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const categories = await ProductService.getAllCategories();

        // Create new PDF document
        const doc = new jsPDF();

        // Set up colors
        const secondaryColor = [128, 128, 128]; // Gray
        const lightGray = [240, 240, 240];

        // Add logo from PNG file
        try {
            const logoPath = path.join(process.cwd(), 'public', 'images', 'logo.png');
            const logoData = fs.readFileSync(logoPath);
            const base64Logo = logoData.toString('base64');
            const logoDataUrl = `data:image/png;base64,${base64Logo}`;
            doc.addImage(logoDataUrl, 'PNG', 10, 10, 40, 30);
        } catch (error) {
            console.error('Error loading logo:', error);
            // Fallback to text logo if PNG fails
            doc.setFillColor(0, 0, 255);
            doc.circle(25, 25, 18, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('3STAR', 20, 22);
            doc.text('FOODS', 18, 28);
        }

        // Add title and date - justified to right edge
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const titleText = "Today's Pricelist";
        const titleWidth = doc.getTextWidth(titleText);
        doc.text(titleText, 200 - titleWidth, 25);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const dateText = `Date: ${today}`;
        const dateWidth = doc.getTextWidth(dateText);
        doc.text(dateText, 200 - dateWidth, 35);

        let yPosition = 60;
        let serialNumber = 1;

        // Process each category
        categories.forEach((category, categoryIndex) => {
            if (categoryIndex > 0) {
                yPosition += 15;
            }

            // Check if we need a new page
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 30;
            }

            // Category title
            doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
            doc.rect(10, yPosition - 8, 190, 12, 'F');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            const categoryText = category.name.toUpperCase();
            const textWidth = doc.getTextWidth(categoryText);
            const centerX = 10 + (190 - textWidth) / 2;
            const centerY = (yPosition - 8) + (12 / 2) + 2;
            doc.text(categoryText, centerX, centerY);
            yPosition += 20;

            // Table header
            doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.rect(10, yPosition - 8, 190, 12, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');

            const columns = [
                { text: 'S/N', x: 10, width: 30 },
                { text: 'Product', x: 40, width: 80 },
                { text: 'Type', x: 120, width: 30 },
                { text: 'Variation', x: 150, width: 25 },
                { text: 'Price (Rs.)', x: 175, width: 25 }
            ];

            columns.forEach(col => {
                const centerY = (yPosition - 8) + (12 / 2) + 2;
                doc.text(col.text, col.x + 2, centerY);
            });

            yPosition += 15;

            // Add products for this category
            category.productLinks.forEach((link) => {
                const product = link.product;
                if (yPosition > 260) {
                    doc.addPage();
                    yPosition = 30;

                    // Re-add table header on new page
                    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
                    doc.rect(10, yPosition - 8, 190, 12, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');

                    const columns = [
                        { text: 'S/N', x: 10, width: 30 },
                        { text: 'Product', x: 40, width: 80 },
                        { text: 'Type', x: 120, width: 30 },
                        { text: 'Variation', x: 150, width: 25 },
                        { text: 'Price (Rs.)', x: 175, width: 25 }
                    ];

                    columns.forEach(col => {
                        const centerY = (yPosition - 8) + (12 / 2) + 2;
                        doc.text(col.text, col.x + 2, centerY);
                    });

                    yPosition += 15;
                }

                // Product row
                doc.setFillColor(255, 255, 255);
                doc.rect(10, yPosition - 8, 190, 12, 'F');
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(11);

                doc.setFont('helvetica', 'normal');
                doc.text(serialNumber.toString(), 15, yPosition + 2);

                doc.setFont('helvetica', 'bold');
                doc.text(product.name, 40, yPosition + 2);

                doc.setFont('helvetica', 'normal');
                doc.text(product.unit || 'N/A', 120, yPosition + 2);
                doc.text('', 150, yPosition + 2);
                doc.text(Number(product.basePrice).toFixed(2), 175, yPosition + 2);

                yPosition += 12;
                serialNumber++;
            });
        });

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        // Return PDF as response
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="todays-rate-${new Date().toISOString().split('T')[0]}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
