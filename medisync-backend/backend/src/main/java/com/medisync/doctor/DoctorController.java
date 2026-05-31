package com.medisync.doctor;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    private final DoctorRepository doctors;

    public DoctorController(DoctorRepository doctors) {
        this.doctors = doctors;
    }

    @GetMapping
    List<DoctorDto> list(@RequestParam(required = false) String q) {
        List<DoctorProfile> results = q == null || q.isBlank()
                ? doctors.findAll()
                : doctors.search(q.trim());
        return results.stream().map(DoctorDto::from).toList();
    }
}
