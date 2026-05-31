package com.medisync.security;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.springframework.stereotype.Service;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
public class TwoFactorService {

    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator(32);
    private final CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
    private final DefaultCodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, new SystemTimeProvider());

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public String generateQrDataUri(String secret, String email) {
        QrData data = new QrData.Builder()
                .label(email)
                .secret(secret)
                .issuer("MediSync")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        try {
            ZxingPngQrGenerator generator = new ZxingPngQrGenerator();
            byte[] imageData = generator.generate(data);
            return getDataUriForImage(imageData, "image/png");
        } catch (QrGenerationException e) {
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    public boolean verify(String secret, String code) {
        return verifier.isValidCode(secret, code);
    }
}
