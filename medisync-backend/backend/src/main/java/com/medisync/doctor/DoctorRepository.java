package com.medisync.doctor;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DoctorRepository extends JpaRepository<DoctorProfile, Long> {
    List<DoctorProfile> findBySpecialtyContainingIgnoreCaseOrLocationContainingIgnoreCase(
            String specialty,
            String location
    );

    @Query("""
            select d from DoctorProfile d
            where lower(d.specialty) like lower(concat('%', :q, '%'))
               or lower(d.location) like lower(concat('%', :q, '%'))
               or lower(d.spokenLanguages) like lower(concat('%', :q, '%'))
               or lower(d.user.firstName) like lower(concat('%', :q, '%'))
               or lower(d.user.lastName) like lower(concat('%', :q, '%'))
               or lower(concat(d.user.firstName, ' ', d.user.lastName)) like lower(concat('%', :q, '%'))
            """)
    List<DoctorProfile> search(@Param("q") String q);

    Optional<DoctorProfile> findByUserEmail(String email);
}
