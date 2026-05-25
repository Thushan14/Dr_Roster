package com.doctorroster.backend.repository;

import com.doctorroster.backend.model.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {
}