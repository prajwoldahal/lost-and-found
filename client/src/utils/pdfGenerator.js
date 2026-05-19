// File: pdfGenerator.js
// Description: Module: Handles pdfGenerator logical operations.

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateReturnReceipt = (post, userData) => {
    const doc = new jsPDF();
    const primaryColor = [30, 58, 138]; // #1E3A8A

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('LOST & FOUND COMMUNITY', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL RETURN RECEIPT', 20, 32);

    // Context Info
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${post.id.substring(0, 8).toUpperCase()}`, 20, 50);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 140, 50);

    // Item Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM INFORMATION', 20, 65);

    doc.autoTable({
        startY: 70,
        head: [['Field', 'Details']],
        body: [
            ['Item Title', post.title],
            ['Category', post.category],
            ['Description', post.description],
            ['Original Date', post.date],
            ['Location', post.locationName],
            ['Status', 'SUCCESSFULLY RETURNED']
        ],
        headStyles: { fillColor: primaryColor },
        theme: 'striped'
    });

    // Participants
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTICIPANTS', 20, finalY);

    doc.autoTable({
        startY: finalY + 5,
        head: [['Role', 'Name', 'Verification']],
        body: [
            ['Finder', post.creatorName || 'Community Member', 'Verified'],
            ['Claimer', post.claimedByName || 'Authenticated Owner', 'Identity Verified']
        ],
        headStyles: { fillColor: primaryColor },
        theme: 'grid'
    });

    // Points earned
    const rewardsY = doc.lastAutoTable.finalY + 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, rewardsY, 170, 20, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.text('COMMUNITY REWARD EARNED: +100 Points', 105, rewardsY + 12, { align: 'center' });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This receipt serves as digital evidence of a successful item return through the Lost & Found Community platform.', 105, pageHeight - 20, { align: 'center' });
    doc.text('Thank you for being an honest member of our community!', 105, pageHeight - 15, { align: 'center' });

    // Save
    doc.save(`Receipt-${post.title.replace(/\s+/g, '-')}.pdf`);
};
