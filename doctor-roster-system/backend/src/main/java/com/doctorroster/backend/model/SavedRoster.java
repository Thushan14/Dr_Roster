package com.doctorroster.backend.model;

import jakarta.persistence.*;

@Entity
public class SavedRoster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String weekStartDate;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String uwRosterJson;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String grRosterJson;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(String weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public String getUwRosterJson() {
        return uwRosterJson;
    }

    public void setUwRosterJson(String uwRosterJson) {
        this.uwRosterJson = uwRosterJson;
    }

    public String getGrRosterJson() {
        return grRosterJson;
    }

    public void setGrRosterJson(String grRosterJson) {
        this.grRosterJson = grRosterJson;
    }
}