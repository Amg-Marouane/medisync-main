package com.medisync.mail;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public void sendInvoiceEmail(String toEmail, String patientName, String invoiceId,
                                 String service, int amount, String date, String paymentMethod, String notes) {
        String subject = "Votre facture " + invoiceId + " - MediSync";
        String content = String.format(
                "Bonjour %s,\n\n" +
                "Veuillez trouver ci-dessous les détails de votre facture.\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Numéro de facture : %s\n" +
                "Prestation        : %s\n" +
                "Date              : %s\n" +
                "Mode de paiement  : %s\n" +
                "Montant           : %d DH\n" +
                "%s" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Pour toute question, contactez notre secrétariat.\n\n" +
                "Cordialement,\nL'équipe MediSync",
                patientName, invoiceId, service, date, paymentMethod, amount,
                (notes != null && !notes.isBlank()) ? "Notes             : " + notes + "\n" : ""
        );

        log.info("Envoi facture {} à {}", invoiceId, toEmail);
        if (mailSender == null) {
            log.warn("SMTP non configuré — simulation envoi facture {} à {}", invoiceId, toEmail);
            log.info("\n=== SIMULATION EMAIL FACTURE ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n================================", toEmail, subject, content);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, false);
            mailSender.send(message);
            log.info("Email facture {} envoyé à {}", invoiceId, toEmail);
        } catch (Exception e) {
            log.warn("Échec envoi email facture {}: {}", invoiceId, e.getMessage());
            log.info("\n=== SIMULATION EMAIL FACTURE ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n================================", toEmail, subject, content);
        }
    }

    public void sendCareSheetEmail(String toEmail, String patientName, String doctorName,
                                    String date, String insurance, String actsText, int total) {
        String subject = "Votre feuille de soins - MediSync";
        String content = String.format(
                "Bonjour %s,\n\n" +
                "Voici votre feuille de soins suite à votre consultation.\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Médecin     : %s\n" +
                "Date        : %s\n" +
                "Assurance   : %s\n\n" +
                "Actes réalisés :\n%s\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "TOTAL : %d DH\n\n" +
                "Cordialement,\nL'équipe MediSync",
                patientName, doctorName, date,
                (insurance != null && !insurance.isBlank()) ? insurance : "Non renseignée",
                actsText, total
        );

        log.info("Envoi feuille de soins à {}", toEmail);
        if (mailSender == null) {
            log.info("\n=== SIMULATION FEUILLE DE SOINS ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n===================================", toEmail, subject, content);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, false);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Échec envoi feuille de soins: {}", e.getMessage());
            log.info("\n=== SIMULATION FEUILLE DE SOINS ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n===================================", toEmail, subject, content);
        }
    }

    public void sendAppointmentConfirmation(String toEmail, String patientName, String doctorName, String dateStr, String startsAt, String reason) {
        String subject = "Confirmation de votre rendez-vous - MediSync";
        String content = String.format(
                "Bonjour %s,\n\n" +
                "Votre rendez-vous avec le Dr. %s est confirmé.\n" +
                "Date : %s à %s\n" +
                "Motif : %s\n\n" +
                "Merci de faire confiance à MediSync.\n" +
                "L'équipe MediSync",
                patientName, doctorName, dateStr, startsAt, reason
        );

        log.info("Tentative d'envoi d'email à {} pour le rendez-vous du {} avec Dr. {}", toEmail, dateStr, doctorName);
        if (mailSender == null) {
            log.warn("Échec de l'envoi de l'email via SMTP (Serveur SMTP non configuré ou indisponible). Affichage dans les logs :");
            log.info("\n=== SIMULATION EMAIL SEND ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n===============================", toEmail, subject, content);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, false); // simple text format
            mailSender.send(message);
            log.info("Email de confirmation envoyé avec succès à {}", toEmail);
        } catch (Exception e) {
            log.warn("Échec de l'envoi de l'email via SMTP: " + e.getMessage());
            log.info("\n=== SIMULATION EMAIL SEND ===\nTO: {}\nSUBJECT: {}\nCONTENT:\n{}\n===============================", toEmail, subject, content);
        }
    }
}
