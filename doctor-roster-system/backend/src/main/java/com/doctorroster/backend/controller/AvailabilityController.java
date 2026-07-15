package com.doctorroster.backend.controller;

import com.doctorroster.backend.model.AvailabilitySlot;
import com.doctorroster.backend.repository.AvailabilityRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AvailabilityController {

    private final AvailabilityRepository availabilityRepository;

    public AvailabilityController(AvailabilityRepository availabilityRepository) {
        this.availabilityRepository = availabilityRepository;
    }

    @GetMapping("/test")
    public String test() {
        return "Backend is running";
    }

    @PostMapping("/availability")
    public String saveAvailability(@RequestBody List<AvailabilitySlot> availabilitySlots) {

        availabilityRepository.saveAll(availabilitySlots);

        return "Availability saved successfully";
    }

    @GetMapping("/availability")
    public List<AvailabilitySlot> getAvailability() {
        return availabilityRepository.findAll();
    }
    @GetMapping("/availability/weeks")
    public List<String> getSavedWeeks() {
        return availabilityRepository.findDistinctWeekStartDates();
    }

    @DeleteMapping("/availability")
    public String deleteAllAvailability() {
        availabilityRepository.deleteAll();
        return "All availability data deleted";
    }
}