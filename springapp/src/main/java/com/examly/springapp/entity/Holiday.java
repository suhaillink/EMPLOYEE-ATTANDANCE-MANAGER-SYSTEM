package com.examly.springapp.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "holidays")
@Getter
@Setter
@NoArgsConstructor
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @JsonProperty("holidayName")
    @JsonAlias({"name", "title"})
    private String holidayName;

    @Column(nullable = false)
    @JsonProperty("holidayDate")
    @JsonAlias({"date"})
    private LocalDate holidayDate;

    private String description;

    public Holiday(Long id, String holidayName, LocalDate holidayDate, String description) {
        this.id = id;
        this.holidayName = holidayName;
        this.holidayDate = holidayDate;
        this.description = description;
    }

    public String getName() {
        return holidayName;
    }

    public void setName(String name) {
        if (name != null && !name.isBlank()) {
            this.holidayName = name;
        }
    }

    public LocalDate getDate() {
        return holidayDate;
    }

    public void setDate(LocalDate date) {
        if (date != null) {
            this.holidayDate = date;
        }
    }
}