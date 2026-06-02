package com.medisync.medical;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.medisync.doctor.DoctorProfile;
import com.medisync.doctor.DoctorRepository;
import java.io.ByteArrayOutputStream;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PdfGeneratorService {
    private final DoctorRepository doctors;

    public PdfGeneratorService(DoctorRepository doctors) {
        this.doctors = doctors;
    }

    public byte[] generatePrescriptionPdf(MedicalRecord record) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);

            // Header Section
            Paragraph title = new Paragraph("MEDISYNC - ORDONNANCE MEDICALE", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(30);
            document.add(title);

            // Fetch Doctor Specialty/Location from profile
            Optional<DoctorProfile> profileOpt = doctors.findByUserEmail(record.getDoctor().getEmail());
            String specialty = profileOpt.map(DoctorProfile::getSpecialty).orElse("Médecin Généraliste");
            String location = profileOpt.map(DoctorProfile::getLocation).orElse("MediSync Clinic");

            // Doctor & Patient Info Section
            Paragraph docInfo = new Paragraph("Médecin prescripteur : Dr. " + record.getDoctor().getFullName() + "\n" +
                    "Spécialité : " + specialty + "\n" +
                    "Adresse : " + location, headerFont);
            docInfo.setSpacingAfter(20);
            document.add(docInfo);

            Paragraph patInfo = new Paragraph("Patient : " + record.getPatient().getFullName() + "\n" +
                    "Numéro de Sécurité Sociale : " + (record.getPatient().getSocialSecurityNumber() != null ? record.getPatient().getSocialSecurityNumber() : "N/A") + "\n" +
                    "Date de l'ordonnance : " + record.getCreatedAt().toString().substring(0, 10), bodyFont);
            patInfo.setSpacingAfter(30);
            document.add(patInfo);

            // Prescription details
            Paragraph titlePrescription = new Paragraph("Prescription :", headerFont);
            titlePrescription.setSpacingAfter(10);
            document.add(titlePrescription);

            Paragraph prescriptionContent = new Paragraph(record.getPrescription() != null ? record.getPrescription() : "Aucun traitement prescrit.", bodyFont);
            prescriptionContent.setSpacingAfter(40);
            document.add(prescriptionContent);

            // Footer
            Paragraph signature = new Paragraph("Signature numérique du praticien", footerFont);
            signature.setAlignment(Paragraph.ALIGN_RIGHT);
            document.add(signature);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return out.toByteArray();
    }
}
