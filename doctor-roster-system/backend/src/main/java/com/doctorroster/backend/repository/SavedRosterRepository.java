package com.doctorroster.backend.repository;

import com.doctorroster.backend.model.SavedRoster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedRosterRepository extends JpaRepository<SavedRoster, Long> {
    List<SavedRoster> findByWeekStartDate(String weekStartDate);
}