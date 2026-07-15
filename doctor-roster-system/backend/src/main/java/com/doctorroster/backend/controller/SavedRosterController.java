package com.doctorroster.backend.controller;

import com.doctorroster.backend.model.SavedRoster;
import com.doctorroster.backend.repository.SavedRosterRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rosters")
@CrossOrigin(origins = "http://localhost:5173")
public class SavedRosterController {

    private final SavedRosterRepository savedRosterRepository;

    public SavedRosterController(SavedRosterRepository savedRosterRepository) {
        this.savedRosterRepository = savedRosterRepository;
    }

    @PostMapping("/save")
    public SavedRoster saveRoster(@RequestBody SavedRoster savedRoster) {
        return savedRosterRepository.save(savedRoster);
    }

    @GetMapping
    public List<SavedRoster> getAllRosters() {
        return savedRosterRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public String deleteRoster(@PathVariable Long id) {
        savedRosterRepository.deleteById(id);
        return "Roster deleted successfully";
    }
}