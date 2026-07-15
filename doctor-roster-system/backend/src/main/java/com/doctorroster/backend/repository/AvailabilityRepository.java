package com.doctorroster.backend.repository;

import com.doctorroster.backend.model.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AvailabilityRepository extends JpaRepository<AvailabilitySlot, Long> {
    List<AvailabilitySlot> findByWeekStartDate(String weekStartDate);

    @Query("SELECT DISTINCT a.weekStartDate FROM AvailabilitySlot a ORDER BY a.weekStartDate DESC")
    List<String> findDistinctWeekStartDates();
}