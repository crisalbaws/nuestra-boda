import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Guest } from '../models/guest.model';
import { Wedding } from '../models/wedding.model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateGuestListPdf(wedding: Wedding, guests: Guest[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${wedding.partner1Name || 'Boda'} & ${wedding.partner2Name || 'Boda'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Lista de Invitados', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Separar confirmados y rechazados
    const confirmed = guests.filter(g => g.confirmed);
    const declined = guests.filter(g => !g.confirmed && g.dietaryRestrictions === 'declined');
    const pending = guests.filter(g => !g.confirmed && g.dietaryRestrictions !== 'declined');

    // Resumen
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN', 14, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const totalAdults = confirmed.reduce((sum, g) => sum + g.plusOnesAdults, 0);
    const totalKids = confirmed.reduce((sum, g) => sum + g.plusOnesKids, 0);

    doc.text(`Confirmados: ${confirmed.length} (${totalAdults} adultos, ${totalKids} niños)`, 14, yPos);
    yPos += 5;
    doc.text(`Rechazados: ${declined.length}`, 14, yPos);
    yPos += 5;
    doc.text(`Pendientes: ${pending.length}`, 14, yPos);
    yPos += 5;
    doc.text(`Total invitados: ${guests.length}`, 14, yPos);
    yPos += 15;

    // Confirmados
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INVITADOS QUE ASISTIRÁN', 14, yPos);
    yPos += 8;

    if (confirmed.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('No hay invitados confirmados', 14, yPos);
      yPos += 10;
    } else {
      // Encabezados
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre', 14, yPos);
      doc.text('Adultos', 110, yPos);
      doc.text('Niños', 135, yPos);
      yPos += 5;

      // Línea
      doc.setLineWidth(0.5);
      doc.line(14, yPos, 155, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      confirmed.forEach((guest, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(guest.name, 14, yPos);
        doc.text(guest.plusOnesAdults.toString(), 115, yPos);
        doc.text(guest.plusOnesKids.toString(), 140, yPos);
        yPos += 6;
      });
    }

    yPos += 10;

    // Rechazados
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INVITADOS QUE NO ASISTIRÁN', 14, yPos);
    yPos += 8;

    if (declined.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('No hay invitados rechazados', 14, yPos);
    } else {
      doc.setFontSize(9);
      doc.text('Nombre', 14, yPos);
      doc.text('Celular', 110, yPos);
      yPos += 5;

      doc.line(14, yPos, 155, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      declined.forEach((guest, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(guest.name, 14, yPos);
        doc.text(guest.phone, 110, yPos);
        yPos += 6;
      });
    }

    // Guardar PDF
    const fileName = `Lista_Invitados_${wedding.partner1Name || 'Boda'}_${wedding.partner2Name || ''}.pdf`;
    doc.save(fileName);
  }
}
