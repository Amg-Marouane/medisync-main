package com.medisync.billing;

import com.medisync.mail.EmailService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final EmailService emailService;

    public BillingController(EmailService emailService) {
        this.emailService = emailService;
    }

    public record SendInvoiceEmailRequest(
            @NotBlank @Email String toEmail,
            @NotBlank String patientName,
            @NotBlank String invoiceId,
            @NotBlank String service,
            @NotNull Integer amount,
            @NotBlank String date,
            @NotBlank String paymentMethod,
            String notes
    ) {}

    public record CareActDto(
            @NotBlank String label,
            @NotBlank String code,
            int quantity,
            int price
    ) {}

    public record SendCareSheetEmailRequest(
            @NotBlank @Email String toEmail,
            @NotBlank String patientName,
            @NotBlank String doctorName,
            @NotBlank String date,
            String insurance,
            @NotNull List<CareActDto> acts
    ) {}

    @PostMapping("/send-invoice-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SECRETARY')")
    public void sendInvoiceEmail(@Valid @RequestBody SendInvoiceEmailRequest req) {
        emailService.sendInvoiceEmail(
                req.toEmail(), req.patientName(), req.invoiceId(),
                req.service(), req.amount(), req.date(), req.paymentMethod(), req.notes()
        );
    }

    @PostMapping("/send-care-sheet-email")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SECRETARY')")
    public void sendCareSheetEmail(@Valid @RequestBody SendCareSheetEmailRequest req) {
        String actsText = req.acts().stream()
                .map(a -> String.format("  - %s (%s) x%d : %d DH", a.label(), a.code(), a.quantity(), a.quantity() * a.price()))
                .reduce("", (a, b) -> a + b + "\n");
        int total = req.acts().stream().mapToInt(a -> a.quantity() * a.price()).sum();

        emailService.sendCareSheetEmail(
                req.toEmail(), req.patientName(), req.doctorName(),
                req.date(), req.insurance(), actsText, total
        );
    }
}
